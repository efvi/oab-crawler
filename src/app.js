'use strict'

const debug = require('debug')('cb7:app')
const fetch = require('node-fetch')
const printf = require('sprintf-js').vsprintf
const jsdom = require('jsdom')
const jquery = require('jquery')
const fs = require('fs')
const path = require('path')
// const moment = require('moment')
// const currencyFormatter = require('currency-formatter')
// const admin = require('firebase-admin')
const constants = require('../config/constants')

module.exports = {
    main: async () => {
        debug('Starting execution...')

        const startYear = 2010
        const currentYear = (new Date()).getFullYear()

        for(let i = startYear; i <= currentYear; i++) {
            const res = await fetch(printf(constants.originUrl, [i, 1]))
            const html = await res.text()

            const {JSDOM} = jsdom
            const dom = new JSDOM(html)
            const $ = jquery(dom.window)

            const pages = $($('.pagination > ul > a').toArray()[$('.pagination > ul > a').toArray().length - 2]).text()

            for(let j = 1; j <= parseInt(pages ? pages : '1'); j++) {
                await scrap(i, j)
            }
        }

        debug('Execution terminated.')
    }
}

async function scrap(year, page) {
    debug(`Year ${year} / Page ${page} starting...`)

    const url = printf(constants.originUrl, [year, page])

    debug(`URL: ${url}`)

    const res = await fetch(url)
    const html = await res.text()

    const {JSDOM} = jsdom
    const dom = new JSDOM(html)
    const $ = jquery(dom.window)

    const list = $('#resultado > article.resultados-encontrados')

    let i = 1
    
    const all = list.children().toArray().map(async element => { 
        const title = $(element).find('.txt-resultado > .txt-resultado-titulo > a').text()

        if(title.indexOf('Primeira') !== -1) {
            debug(title)

            const desc = $(element).find('.resultado-descricao > .resultado-provas-dados')
            debug($(desc).find('.txt-resultado-descricao').text().split(' - ')[0])

            const download = $(desc).find('.txt-resultado-download > #download-prova > .itens-provas > li:first > a')
            const urlExam = `https://www.qconcursos.com${$(download).attr('href')}`
            debug(urlExam)

            const filename = `${year.toString()}-0${i++}.pdf`
            debug(`Downloading ${filename}...`)
            try {
                const res = await fetch(urlExam)
                const buf = await res.buffer()
                fs.writeFileSync(path.join(constants.pdfDestination, filename), buf)
                
                debug(`${filename} saved.`)

                return Promise.resolve(element) 
            } catch(err) {
                debug(JSON.stringify(err))

                return Promise.reject(err) 
            }
        } else {
            return Promise.resolve(element) 
        }
    })

    await Promise.all(all)
        .then(results => {
            debug(`Year ${year} / Page ${page} terminated.`)
        })  
}