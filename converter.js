var TurndownService = require('turndown');
const fs = require('fs');

var turndownService = new TurndownService();
turndownService.keep(['figure', 'iframe', 'div']);

const accordioner = (html, outputPath) => {
  const headerclass = 'wp-accordion';

  if (outputPath && outputPath.endsWith('.html') && html.indexOf(headerclass) > -1) {
    const classsearchexp = /<(?<tag>\w+)\s+[^>]*(?<class>wp-accordion(?:-content)?)[^"]*"[^>]*>/gm;
    const getAccordionStartTags = searchArea => [...searchArea.matchAll(classsearchexp)]
      .map(r => ({
        tag: r.groups.tag,
        class: r.groups.class,
        index: r.index,
        fulltag: r[0]
      }));

    const getNextTag = (searchArea, tag) =>
      [...searchArea.matchAll(new RegExp('<(?<closeslash>/?)' + tag + '\\b[^>]*>', 'm'))]
        .map(r => ({
          index: r.index,
          isCloseTag: r.groups.closeslash.length > 0,
          fulltag: r[0]
        }))[0];

    const getEndTag = (tag, html, startIndex) => {
      let resultIndex = startIndex;
      let startTagsActive = 0;
      let loopsafe = 100;
      let searchArea = html.substring(startIndex);

      while (--loopsafe > 0) {
        const nextTag = getNextTag(searchArea, tag);
        if (!nextTag) throw `Can't find matching end tag - ${tag}`;
        const resultOffset = nextTag.index + nextTag.fulltag.length;
        resultIndex += resultOffset;
        if (nextTag.isCloseTag) {
          if (startTagsActive === 0) {
            nextTag.index = resultIndex;
            return nextTag;
          } else {
            startTagsActive--;
          }
        } else {
          // new open tag
          startTagsActive++;
        }
        searchArea = searchArea.substring(resultOffset);
      } // while
    }; // getEndTag

    // Create a list of all accordion content in order
    const accordionContent = getAccordionStartTags(html)
      .map(nextTag => ({
        nextTag,
        endTag: getEndTag(nextTag.tag, html, nextTag.index + nextTag.fulltag.length)
      }))
      .map(tags => ({
        html: html.substring(tags.nextTag.index, tags.endTag.index),
        header: tags.nextTag.class === 'wp-accordion'
      }));

    let result = html;
    // loop and build content
    for (let resultIndex = 0; resultIndex < accordionContent.length; resultIndex++) {
      const row = accordionContent[resultIndex];
      if (row.header) {
        const headerHTML = row.html
          .replace(/wp-accordion/, '')
          .replace(/ class=""/, '');

        let bodyHTML = '';
        // fill the body
        let bodyIndex = resultIndex + 1;
        while (bodyIndex < accordionContent.length && !accordionContent[bodyIndex].header) {
          const bodyRowHTML = accordionContent[bodyIndex].html;
          bodyHTML += bodyRowHTML
            .replace(/wp-accordion-content/, '')
            .replace(/ class=""/, '') + '\n';
          bodyIndex++;

          // remove this content tag from html
          result = result.replace(bodyRowHTML, '');
        } // while

        const finalHTML = `
<cwds-accordion>
  <div class="card">
    <button class="card-header accordion-alpha" type="button" aria-expanded="false">
      <div class="accordion-title">${headerHTML}</div>
    </button>
    <div class="card-container" aria-hidden="true" style="height: 0px;">
      <div class="card-body">${bodyHTML}</div>
    </div>
  </div>
</cwds-accordion>
`;

        // replace the header with the new merged content
        result = result.replace(row.html, finalHTML);
      } // if(row.header)
    } // for
    return result;
  }
  return html;
};

const glob = require('glob');

glob('pages/wordpress-posts/**/*.html', {}, (_, files) => {
  files.forEach(file => {
    const path = `./${file}`;
    fs.readFile(path, 'utf8', (_, data) => {
      const html = accordioner(data, path);
      fs.writeFileSync(path, html, { encoding: 'utf8', flag: 'w' });
    });
  });
});
