#!/usr/bin/env ts-node

import { isRegExp } from './utils.js'
import { Cards } from '../dataset.js'
import { Matchers, MatchQuery } from './parserIdentifier.js'
import ReplaceTable from './parserReplaceTable.js'
import type { Matcher } from './parserIdentifier.js'
import { writeFileSync } from 'node:fs'

type keyIdols = keyof typeof Cards
let err = 0
let total = 0
const matcherStatus: Record<number, number> = {}

function applyMatchQuery(
  text: string,
  mq: MatchQuery,
  lastIndex: number
): [string | null, Record<string, any>, number] | null {
  if (typeof mq === 'string') {
    const index = text.indexOf(mq, lastIndex)
    if (index !== -1) return [mq, {}, index + mq.length]
    return null
  } else if (isRegExp(mq)) {
    const match = text.slice(lastIndex).match(mq)
    if (match === null) return null
    return [
      match[1],
      match.groups ?? {},
      lastIndex + match.index! + match[0].length,
    ]
  }
  return null
}

function applyMatcher(
  text: string,
  matcher: Matcher,
  debug: boolean = false
): Record<string, any> | null {
  const { spec, body } = matcher
  let lastIndex = 0
  let data: Record<string, string> = {}
  for (const specItem of spec) {
    if (Array.isArray(specItem)) {
      // set-value
      const [key, mqs] = specItem
      let ok = false
      // one success -> OK!
      for (const mq of mqs) {
        const ret = applyMatchQuery(text, mq, lastIndex)
        if (ret !== null && ret[2] > lastIndex) {
          lastIndex = ret[2]
          ok = true
          if (ret[0]) data[key] = ret[0]
          data = {
            ...data,
            ...ret[1],
          }
          break
        }
      }
      if (!ok) {
        // set-value failed, exit
        if (debug) {
          console.info(`Failed [matchGroup]: ${specItem}`)
        }
        return null
      }
    } else {
      // check
      const ret = applyMatchQuery(text, specItem, lastIndex)
      if (ret === null || ret[2] <= lastIndex) {
        // check failed, exit
        if (debug) {
          console.info(`Failed [match]: ${specItem}`)
        }
        return null
      }
      lastIndex = ret[2]
      data = {
        ...data,
        ...ret[1],
      }
      // otherwise, continue
    }
  }

  return body(data)
}

function parseSkill(__s: string) {
  let _s = __s
  for (const [fr, to] of Object.entries(ReplaceTable)) {
    _s = _s.replace(new RegExp(fr, 'g'), to)
  }
  const s = _s
    .replace(/\[(\d+)拍\]/g, ' [$1拍]')
    .replace(/[\n 、·]+/g, ' ')
    .split(' ')
  total += s.length
  const rets = []
  for (const part of s) {
    // a part
    let ret = null
    for (const [index, matcher] of Matchers.entries()) {
      ret = applyMatcher(part, matcher)
      if (ret !== null) {
        matcherStatus[index] = (matcherStatus[index] ?? 0) + 1
        break
      }
    }

    if (ret === null) {
      // no matchers worked
      console.log(part)
      err++
    } else {
      // match OK!
      rets.push(ret)
    }
  }

  return rets
}

function main() {
  // Don't get the type serious here; build the complete type in the schema
  const obj: Partial<Record<keyIdols, Record<string, Record<string, any>>>> = {}
  for (const idol of Object.keys(Cards) as keyIdols[]) {
    for (const cardSlug of Object.keys(Cards[idol])) {
      const card = Cards[idol][cardSlug]
      const ret: Record<string, any> = {}

      if (card.ski1DescCn) ret.ski1 = parseSkill(card.ski1DescCn)
      if (card.ski2DescCn) ret.ski2 = parseSkill(card.ski2DescCn)
      if (card.ski3DescCn) ret.ski3 = parseSkill(card.ski3DescCn)
      ;(obj[idol] || (obj[idol] = {}))[cardSlug] = ret
    }
  }
  writeFileSync('cardSkills.json', JSON.stringify(obj))
}

main()
console.log(`Total ${total}, skipped ${err}`)

// console.log(
//   applyMatcher(
//     '谁的A技能发动之前',
//     {
//       spec: [/谁的?/, ['typ', [/(sp)/i, /(a)/i]], '发动前'],
//       body: ({ typ }) => ({
//         type: 'when',
//         when: {
//           before: typ.toUpperCase(),
//         },
//       }),
//     },
//     true
//   )
// )
