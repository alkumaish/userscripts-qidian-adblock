// ==UserScript==
// @name        webnovel.com skip video ads
// @namespace   https://github.com/alkumaish
// @author	Hussain Alkumaish <makosama[NOSPAM]@gmail.com>
// @homepageURL	https://github.com/alkumaish/userscripts-qidian-adblock
// @version     5
// @description skips qidian adwall
// @run-at      document-end
// @match       *://www.webnovel.com/*
// @match	*://m.webnovel.com/*
// @include	*://*webnovel.com/*
// @grant	none
// ==/UserScript==

//------------------------------------------------------------------------------
// This script is released under the GNU GPLv3.
// Any and all modifications published should be licensed in accordance with
// the GPLv3 terms.
//
// Hussain Alkumaish @ <makosama[NOSPAM]@gmail.com> 
//------------------------------------------------------------------------------

// How frequently this script should check for new chapters.
//
// The amount is in milliseconds.
const INTERVAL_CHAPTER_CHECK = 1000;

// When a token is not ready yet, this is how much time we should wait
// before trying again.
//
// The amount is in milliseconds.
const INTERVAL_TOKEN_CHECK = 1000;

/**
 * Check for new chapters and try to remove the adwall from them.
 */
function main() {
  Array.from(
    // Locked chapters.
    document.querySelectorAll('.cha-content._lock')
  ).forEach((lock) => {
    // Remove this class so this chapter won't be processed the next time
    // `main` is called.
    lock.classList.remove('_lock');

    // Remove the video.
    const v = lock.closest('.chapter_content').querySelector('.lock-video');
    if (v) {
      v.remove();
    }

    // Element with the chapter content.
    const contentElement = lock.querySelector('.cha-words');

    contentElement.style.opacity = '0.1';

    // Get the ID for the series ("book").
    //
    // Some chapters have the `data-bid` property, but not all of them.
    // That's why it's better to just get this from the URL.
    const bid = window.location.href.split('/book/')[1].split('/')[0];

    // Get the ID for the chapter.
    const { cid } = lock.querySelector('[data-cid]').dataset;

    // Both ID are required.
    if (!bid || !cid) {
      return;
    }

    return fetch(
      `https://www.webnovel.com/apiajax/chapter/GetChapterContentToken?bookId=${bid}&chapterId=${cid}`
    )
      .then(resp => resp.json())
      .then(data => data.data.token)
      .then(token => encodeURIComponent(token))
      .then(token => new Promise((resolve) => {
        // The raw body of the chapter.
        //
        // It will be plain text, so we must manually build the HTML for it.
        let content = '';

        // Try to get the content of the chapter, and fulfill the promise once
        // we have it.
        //
        // This function will retry until it succeeds.
        function tick() {
          const url = `https://www.webnovel.com/apiajax/chapter/GetChapterContentByToken?token=${token}`;

          fetch(url)
            .then(resp => resp.json())
            .then((data) => {
              content = data.data.content.trim();

              if (content) {
                resolve(content);
              } else {
                setTimeout(tick, INTERVAL_TOKEN_CHECK);
              }
            })
            .catch((err) => {
              console.error(err.stack);

              tick();
            });
        }

        tick();
      }))
      .then((content) => {
        // Build the HTML for the chapter content.
        //
        // For now we only split on line breaks and wrap each piece
        // with "<p></p>" tags.
        const chapterHtml = content
          .split('\n')
          .map(p => p.trim())
          .filter(p => !!p)
          .map(p => `<p>${p}</p>`)
          .join('');

        // Update the chapter content and turn opacity back to 100%.
        contentElement.innerHTML = chapterHtml;
        contentElement.style.opacity = '1';
      })
      .catch((err) => {
        console.error(err.stack);
      });
  });
}

function m_main() {
  Array.from(
    // Locked chapters.
    document.querySelectorAll('.j_chapterWrapper')
  ).forEach((lock) => {
    // Remove this class so this chapter won't be processed the next time
    // `main` is called.
    lock.classList.remove('j_chapterWrapper');
    
    // Element with the chapter content.
    const contentElement = lock.querySelector('.j_chaTxt.cha-txt.cha-txt-hide');
    contentElement.classList.remove('cha-txt-hide');
    
    contentElement.style.opacity = '0.1';
    
    // Get the ID for the series ("book").
    //
    // Some chapters have the `data-bid` property, but not all of them.
    // That's why it's better to just get this from the URL.
    const bid = window.location.href.split('/book/')[1].split('/')[0];
    
    // Get the ID for the chapter.
    //const cid = window.location.href.split('/book/')[1].split('/')[1];
    const cid = lock.id.split('-')[1];
    
    // Both ID are required.
    if (!bid || !cid) {
      return;
    }

    var csrfTok;
    var x = document.cookie.split(';'); 
    for (var i = 0; i < x.length; i++) { 
	    var c = x[i]; 
	    c = c.trim();
	    if (c.startsWith("_csrf")) csrfTok = c; 
    }
    
    return fetch(
		    `https://m.webnovel.com/ajax/chapter/getChapterContentToken?${csrfTok}&bookId=${bid}&chapterId=${cid}`
    )
      .then(resp => resp.json())
      .then(data => data.data.token)
      .then(token => encodeURIComponent(token))
      .then(token => new Promise((resolve) => {
        // The raw body of the chapter.
        //
        // It will be plain text, so we must manually build the HTML for it.
        let content = '';

        // Try to get the content of the chapter, and fulfill the promise once
        // we have it.
        //
        // This function will retry until it succeeds.
        function tick() {
          const url = `https://m.webnovel.com/ajax/chapter/getChapterContentByToken?${csrfTok}&token=${token}`;

          fetch(url)
            .then(resp => resp.json())
            .then((data) => {
              content = data.data.content.trim();

              if (content) {
                resolve(content);
              } else {
                setTimeout(tick, INTERVAL_TOKEN_CHECK);
              }
            })
            .catch((err) => {
              console.error(err.stack);

              tick();
            });
        }

        tick();
      }))
      .then((content) => {
        // Build the HTML for the chapter content.
        //
        // For now we only split on line breaks and wrap each piece
        // with "<p></p>" tags.
        const chapterHtml = content
          .split('\n')
          .map(p => p.trim())
          .filter(p => !!p)
          .map(p => `<p>${p}</p>`)
          .join('');

        // Update the chapter content and turn opacity back to 100%.
        contentElement.innerHTML = chapterHtml;
        contentElement.style.opacity = '1';
      })
      .catch((err) => {
        console.error(err.stack);
      });
  });
}


// Since Qidian may load new chapters without refreshing the page, we must
// continuously check for new chapters in the page.
if (document.location.href.startsWith('https://www.webnovel.com/book')) {
	setInterval(main, INTERVAL_CHAPTER_CHECK);
}

if (document.location.href.startsWith('https://m.webnovel.com/book')) {
	setInterval(m_main, INTERVAL_CHAPTER_CHECK);
}

if (document.location.href.startsWith('https://www.webnovel.com/rssbook/')) {
	if (g_data.url) {
		window.location.replace(g_data.url);
	}
}

if (document.location.href.startsWith('https://m.webnovel.com/rssbook/')) {
	window.location.replace(document.location.href.replace("rssbook","book"));
}
