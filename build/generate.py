#!/usr/bin/env python3
# encoding: utf-8
'''

Utility script for generating the redirect-like intermediary URLs.

==================
! SPOILERS AHEAD !
==================

The redirects exist so that:

* Challenges can be easily re-ordered during development.
* There is no previous answer in the address bar while solving a challenge
  (might distract).
* The URL matches the challenge title (and no restriction on the name
  of a challenge).
* You can (un)intentionally share links to a challenge with only a
  minor spoiler, and not reveal an answer. By extent, this also means
  one is also less likely to (accidentally) be faced with answers
  through exposure to chat logs, search engines, archive.org, etc.

The reason I use symlinks with `history.replaceState()` instead
of server-side redirects (or client-side `<meta http-equiv="refresh">`
redirects):

* Server-side redirects make the hunt more difficult to archive
  and distribute. They also make it less portable in that they require
  a specific scripting language (and thus non-html file extension, or
  additional server setup), or CGI (like Python), or specific web
  server (Apache htaccess file, or lighttpd config).

  It is desirable for me to be able to put this on a shared host
  and turn off everything besides static Apache, not worrying about
  some server-side exploit.

  If I revisit this in the future, I'd likely go with an htaccess file.
  However that does mean during development I couldn't simply use use
  a python3 or php built-in web servers from the source directory.

* Client-side redirects tend to flash an intermediary page,
  which I don't like. I did consider this, and had the below code
  do a string search for `<title>Redirecting</title>` to determine
  whether to safely overwrite an uncommitted file.

* The ability to differentiate client-side between landing on an
  answer vs a plain challenge URL lended itself to a "convenient"
  hack in the bonus challenge.
'''

# Copyright 2021 Timo Tijhof <https://timotijhof.net> | MIT License


import html
import json
import os
import re


def make_redirects(public_html, start, finish, order, answers,
                   extra_pairs=[]):
    redirect_pairs = []
    prevPage = start
    for page in order:
        prevAnswer = answers[prevPage]
        redirect_pairs.append((prevAnswer, page))
        prevPage = page

    redirect_pairs.append((answers[prevPage], finish))
    redirect_pairs.append(*extra_pairs)

    print('Updating redirects...')
    # print(*redirect_pairs, sep='\n')

    # Create or update symlinks
    for (fromPage, toPage) in redirect_pairs:
        from_path = os.path.join(public_html, fromPage)
        to_path = os.path.join('.', toPage)

        if os.path.islink(from_path):
            os.unlink(from_path)

        # In Python, os.symlink(src, dst) means:
        # src = destination of link.
        # dst = the path where the link is created at.
        os.symlink(to_path, from_path)


def generate_copyright_html(copyright_txt_path, copyright_html_path):
    '''
    Regenerate HTML credits

    See also: https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
    '''

    credits_data = []
    credits_block = {}
    credits_block_key = None

    print('Updating COPYRIGHT.html...\nInput: %s\nOutput: %s\n' % (copyright_txt_path, copyright_html_path))
    with open(copyright_txt_path, encoding='UTF-8') as f:
        for num, line in enumerate(f, 1):
            line = line.rstrip('\n')
            if line == '':
                if credits_block_key is not None:
                    # end of block, start of new block
                    credits_data.append(credits_block)
                    credits_block = {}
                    credits_block_key = None
                # else: ignore superfluous blank lines.
            elif line.startswith(' '):
                # continue key
                if credits_block_key is None:
                    raise ValueError('Unable to continue value on line %d' % num)
                if line == ' .':
                    credits_block[credits_block_key] += '\n'
                else:
                    credits_block[credits_block_key] += '\n' + line.lstrip(' ')
            elif ': ' in line:
                # new key
                (key, sep, value) = line.partition(': ')
                credits_block[key] = value
                credits_block_key = key
            else:
                raise ValueError('Unable to parse line %d' % num)

    # implicitly end the last block
    if credits_block_key is not None:
        credits_data.append(credits_block)
        credits_block = None
        credits_block_key = None

    credits_html = ''

    for block in credits_data:
        preview_html = ''
        if 'Files' in block:
            files_h2_html = []
            for file in block['Files'].split(' '):
                file_url_html = html.escape(file)
                if '*' in file_url_html:
                    file_h2_html = file_url_html
                else:
                    if preview_html == '' and file_url_html.endswith(('.png', '.jpg', '.gif')):
                        # if multiple, preview the first
                        preview_html = '<span class="copyright-preview" style="background-image: url(%s);"></span>\n' % (file_url_html)
                    file_h2_html = '<a href="%s">%s</a>' % (file_url_html, file_url_html)
                files_h2_html.append(file_h2_html)
            credits_html += '<h2>%s</h2>\n' % ' '.join(files_h2_html)
        credits_html += preview_html
        credits_html += '<ul>\n'
        for key, value in block.items():
            if key == 'Files':
                continue
            key_html = html.escape(key)
            value_html = html.escape(value)
            if key == 'License':
                value_html = '<a href="https://spdx.org/licenses/%s">%s</a>' % (value_html, value_html)
            elif (key == 'Source' or key == 'Format') and value_html.startswith('http'):
                value_html = '<a href="%s">%s</a>' % (value_html, value_html)
            else:
                value_html = value_html.replace('\n\n', '<br>')
                value_html = re.sub(
                    r'&lt;(https?://.*?)&gt;',
                    r'&lt;<a href="\g<1>">\g<1></a>&gt;',
                    value_html
                )
            credits_html += '<li>%s: %s</li>\n' % (key_html, value_html)
        credits_html += '</ul>\n'

    with open(copyright_html_path, 'r') as f:
        old_credits_html = f.read()
        new_credits_html = re.sub(
            r'<main>.*</main>',
            '<main>\n%s\n</main>' % credits_html,
            old_credits_html,
            flags=re.MULTILINE | re.DOTALL
        )

    with open(copyright_html_path, 'w') as f:
        f.write(new_credits_html)


build_dir = os.path.dirname(os.path.abspath(__file__))
html_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'public_html'
)

generate_copyright_html(
    copyright_txt_path=os.path.join(html_dir, 'COPYRIGHT.txt'),
    copyright_html_path=os.path.join(html_dir, 'COPYRIGHT.html')
)

start = 'index.html'
finish = 'credits.html'

'''
The answers.json file must be structured like:

{
  "index.html": "chicken.html",
  "play.html": "ANSWER.html",
  "drive.html": "ANSWER.html",
  "translate.html": "ANSWER.html",
  "ducks.html": "ANSWER.html",
  "vault.html": "ANSWER.html",
  "ziploc.html": "ANSWER.html"
}
'''

ansers_file = os.path.join(build_dir, 'answers.json')
with open(ansers_file, 'r') as f:
    answers_json = f.read()
answers = json.loads(answers_json)

make_redirects(
    public_html=html_dir,
    start=start,
    finish=finish,
    order=[
        'banana.html',
        'play.html',
        'drive.html',
        'translate.html',
        'ducks.html',
        'vault.html',
    ],
    answers=answers,
    extra_pairs=[
        # Bonus
        (answers['ziploc.html'], 'ziploc.html')
    ]
)
