import isRegExp from '@stdlib/assert-is-regexp';
import isRegExpStr from '@stdlib/assert-is-regexp-string';

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const caniuse = require('caniuse-db/data')
const caniuseArr = Object.entries(caniuse.data)

const defaultConfig = {
  searchFields: ['title', 'description', 'notes', 'keywords', ['categories']],
  minimumSupport: 60
}

const _search = (query, config) => {
  const foundFeatures = _findFeature(query, config)

  if (foundFeatures.length === 0) {
    throw new Error(`${query} did not match any features`)
  }

  return foundFeatures.filter(f => {
    return f[1].usage_perc_y >= config.minimumSupport
  }).map(f => f[0])
}

const _findFeature = (query, config) => {
  const results = caniuseArr.filter( F => {
    const featureName = F[0];
    const featureData = F[1];

    const featureFields = config.searchFields.map(s => {
      if (!(s in featureData)) {
        console.warn(`searchField ${s} is not on ${featureName}`)
      }
      return featureData[s]
    })
      .filter(e => e)
      .flat()

    return featureFields.some(f => f && f.match(query))
  })

  return results
}

export const whatcaniuse = (search, providedConfig = {}) => {
  const config = Object.assign(defaultConfig, providedConfig)

  if (isRegExpStr(search) || typeof search === 'string') {
    search = new RegExp(search)
  }

  if (isRegExp(search)) {
    return _search(search, config)
  } else {
    throw new Error(`whatcanuse.search needs to be called with a string or RegExp. Provided: ${search}`)
  }
}

export {whatcaniuse as default};
