/* This file is part of Indico.
 * Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico; if not, see <http://www.gnu.org/licenses/>.
 */

import {handleAxiosError, indicoAxios} from 'indico/utils/axios';


const $t = $T.domain('ursh');

function _showTip(element, msg) {
    element.qtip({
        content: {
            text: msg
        },
        hide: {
            event: 'unfocus',
            fixed: true,
            delay: 700
        },
        show: {
            event: false,
            ready: true
        }
    });
}

async function _makeUrshRequest(data, endpoint = '/ursh') {
    let response;
    try {
        console.log(data);
        response = await indicoAxios.post(endpoint, data);
    } catch (error) {
        handleAxiosError(error);
        return;
    }

    return response.data.url;
}

function _validateAndFormatURL(url) {
    if (!url) {
        throw Error($t.gettext('Please fill in a URL to shorten'));
    }

    // if protocol is missing, prepend it
    if (url.startsWith(location.hostname)) {
        url = `${location.protocol}//${url}`;
    }

    // regular expression, because I.E. does not like the URL class
    // provides minimal validation, leaving the serious job to the server
    const re = RegExp(`^([\\d\\w]+:)//([^/ .]+(?:\\.[^/ .]+)*)(/.*)?$`);
    const urlTokens = url.match(re);
    if (!urlTokens) {
        throw Error($t.gettext('This does not look like a valid URL'));
    }

    // extract tokens
    let protocol = urlTokens[1];
    const hostname = urlTokens[2];
    const path = urlTokens[3] ? urlTokens[3] : '/';

    protocol = location.protocol;  // patch protocol to match server
    if (hostname !== location.hostname) {
        throw Error($t.gettext('Invalid host: only Indico URLs are allowed'));
    }

    return `${protocol}//${hostname}${path}`;
}

function _getUrshInput(input) {
    const inputURL = input.val().trim();
    input.val(inputURL);

    try {
        const formattedURL = _validateAndFormatURL(inputURL);
        input.val(formattedURL);
        return formattedURL;
    } catch (err) {
        _showTip(input, err.message);
        input.focus().select();
        return null;
    }
}

async function _handleUrshPageInput(evt) {
    evt.preventDefault();

    const input = $('#ursh-shorten-input');
    const originalURL = _getUrshInput(input);
    if (originalURL) {
        const result = await _makeUrshRequest({
            original_url: originalURL,
        });
        if (result) {
            const outputElement = $('#ursh-shorten-output');
            $('#ursh-shorten-response-form').slideDown();
            outputElement.val(result);
            outputElement.select();
        } else {
            _showTip(input, $t.gettext('This does not look like a valid URL'));
            input.focus().select();
        }
    }
}

async function _handleUrshClick(evt) {
    evt.preventDefault();

    const originalURL = evt.target.dataset.originalUrl;
    const result = await _makeUrshRequest({
        original_url: originalURL,
    });

    if (result) {
        $(evt.target).copyURLTooltip(result, 'unfocus');
    } else {
        _showTip($(evt.target), $t.gettext('URL shortening service error'));
    }
}

async function _handleUrshCreate(evt) {
    window.locals = {};
    window.locals.endpoint = evt.target.dataset.endpoint;
}

function _validateCustomShortcut(input, minSize = 5) {
    const value = input.val();
    if (value.length < minSize) {
        input.focus();
        _showTip(input, $t.gettext('Shortcut is too small'));
        return false;
    }
    return true;
}

async function _handleUrshCustomShortcut(evt) {
    evt.preventDefault();

    const serverElement = $('#ursh-create-custom-server');
    const shortcutElement = $('#ursh-create-custom-input');
    const originalURLElement = $('#ursh-create-custom-target');

    if (!_validateCustomShortcut(shortcutElement)) {
        return;
    }

    const resultingURL = await _makeUrshRequest({
        original_url: originalURLElement.val(),
        shortcut: shortcutElement.val(),
    }, window.locals.endpoint);

    if (resultingURL) {
        const result = `${serverElement.text()}${shortcutElement.val()}`;
        $(evt.target).copyURLTooltip(result, 'unfocus');
    } else {
        _showTip($(evt.target), $t.gettext('This shortcut is already in use'));
    }
}

$(document)
    .on('click', '#ursh-shorten-button', _handleUrshPageInput)
    .on('keydown', '#ursh-shorten-input', (evt) => {
        if (evt.key === 'Enter') {
            _handleUrshPageInput(evt);
        }
    })
    .on('click', '.ursh-get', _handleUrshClick)
    .on('click', '.ursh-create', _handleUrshCreate)
    .on('click', '#ursh-create-custom-button', _handleUrshCustomShortcut)
    .on('keydown', '#ursh-create-custom-input', (evt) => {
        if (evt.key === 'Enter') {
            _handleUrshCustomShortcut(evt);
        }
    });

$(document).ready(() => {
    // keep dropdown menu open when clicking on an entry
    $('.ursh-dropdown').next('ul').find('li a').on('menu_select', () => true);
});
