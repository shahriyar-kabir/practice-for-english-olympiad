"""Functional browser checks. Requires Python Playwright and a running npm run dev.
Run: python3 scripts/browser_smoke.py [base-url]
The system Chromium is used unless PLAYWRIGHT_CHROMIUM_EXECUTABLE is set.
"""
import json
import os
from pathlib import Path
import re
import sys
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'src/data/puzzles.ts').read_text()
puzzles = json.loads(source.split('export const puzzles: Puzzle[] = ', 1)[1].rstrip().removesuffix(';'))
url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5173'
KEY = 'wordsprout-progress-v1'
checks = []
errors = []

def passed(name):
    checks.append(name)
    print('PASS', name, flush=True)

def solved(page):
    return int(page.get_by_role('progressbar', name='Words found').get_attribute('aria-valuenow'))

def local(page):
    return page.evaluate('(key) => JSON.parse(localStorage.getItem(key) || "{}")', KEY)

def adventure(page, index):
    page.locator('.adventure').nth(index).click()
    expect(page.get_by_role('region', name=f'{puzzles[index]["title"]} crossword')).to_be_visible()

def choose(page, entry):
    page.get_by_role('tab', name=re.compile(entry['direction'].title())).click()
    page.locator(f'[data-clue="{entry["id"]}"]').click()

def clean(page):
    page.evaluate('localStorage.clear()')
    page.reload()
    expect(page.locator('#page-heading')).to_be_visible()
    page.wait_for_timeout(150)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1100}, reduced_motion='reduce')
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(url)
    expect(page.locator('#page-heading')).to_be_visible(timeout=60000)
    clean(page)
    assert page.locator('.adventure').count() == 10
    assert solved(page) == 0
    passed('10 adventures load with zero initial progress')
    page.get_by_role('tab', name=re.compile('Across')).focus()
    page.keyboard.press('ArrowRight')
    expect(page.get_by_role('tab', name=re.compile('Down'))).to_be_focused()
    expect(page.get_by_role('tab', name=re.compile('Down'))).to_have_attribute('aria-selected', 'true')
    page.keyboard.press('Home')
    expect(page.get_by_role('tab', name=re.compile('Across'))).to_be_focused()
    expect(page.get_by_role('tab', name=re.compile('Across'))).to_have_attribute('aria-selected', 'true')
    passed('clue tabs support arrow and Home keyboard navigation')

    page.get_by_role('button', name='Place RABBIT', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('Good try!')
    assert solved(page) == 0
    assert page.locator('.cell-letter').all_text_contents().count('') == page.locator('.cell-letter').count()
    passed('wrong answer gives feedback and leaves progress/grid unchanged')

    page.get_by_role('button', name='Place MONKEY', exact=True).click()
    expect(page.get_by_role('button', name='MONKEY, found', exact=True)).to_be_disabled()
    assert solved(page) == 1
    expect(page.get_by_role('status')).to_contain_text('Monkey is right!')
    assert page.locator('.cell-solved').count() == 6
    passed('tap correct answer fills six cells, marks tile found, and advances selection')

    # Exercise native HTML drag-and-drop events via Playwright's real pointer dragging.
    sheep = puzzles[0]['entries'][1]
    source_tile = page.get_by_role('button', name='Place SHEEP', exact=True)
    target = page.locator(f'.crossword-cell[data-row="{sheep["row"]}"][data-col="{sheep["col"]}"]')
    source_tile.drag_to(target)
    assert solved(page) == 2, 'Native drag_to failed to place SHEEP'
    passed('native mouse drag-and-drop places the correct word')

    # DataTransfer route verifies dropped text onto a selected word / intersection.
    giraffe = puzzles[0]['entries'][2]
    choose(page, giraffe)
    data = page.evaluate_handle('() => { const d = new DataTransfer(); d.setData("text/plain", "GIRAFFE"); return d; }')
    target = page.locator(f'.crossword-cell[data-row="{giraffe["row"]}"][data-col="{giraffe["col"]}"]')
    target.dispatch_event('dragover', {'dataTransfer': data})
    target.dispatch_event('drop', {'dataTransfer': data})
    assert solved(page) == 3
    passed('DataTransfer drop fills selected crossword entry')

    before = page.locator('.cell-letter').all_text_contents()
    page.get_by_role('button', name='A little hint', exact=True).click()
    after = page.locator('.cell-letter').all_text_contents()
    assert sum(bool(letter) for letter in after) == sum(bool(letter) for letter in before) + 1
    assert solved(page) == 3
    saved = local(page)
    assert saved['animal-friends']['hints']
    passed('hint reveals one new letter without solving a word')
    page.reload()
    expect(page.locator('#page-heading')).to_be_visible()
    assert solved(page) == 3
    assert local(page) == saved
    assert page.locator('.cell-hinted').count() >= 1
    passed('correct words and hint letters persist after reload')

    adventure(page, 1)
    assert solved(page) == 0
    classroom_first = puzzles[1]['entries'][0]
    page.get_by_role('button', name=f'Place {classroom_first["answer"]}', exact=True).click()
    assert solved(page) == 1
    adventure(page, 0)
    assert solved(page) == 3
    passed('puzzle switching keeps separate progress')

    page.get_by_role('button', name='How to play', exact=True).click()
    expect(page.get_by_role('dialog', name='How to play', exact=True)).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_have_count(0)
    page.get_by_role('button', name='My progress', exact=True).click()
    expect(page.get_by_role('dialog', name='My progress')).to_contain_text('4 / 110')
    page.get_by_role('button', name='Close dialog', exact=True).click()
    passed('help and progress dialogs open, report totals, and dismiss with Escape/button')

    page.get_by_role('button', name='Start over', exact=True).click()
    page.get_by_role('button', name='Keep playing', exact=False).click()
    assert solved(page) == 3
    page.get_by_role('button', name='Start over', exact=True).click()
    page.get_by_role('button', name='Start fresh', exact=False).click()
    assert solved(page) == 0
    assert not local(page)['animal-friends']['hints']
    adventure(page, 1)
    assert solved(page) == 1
    adventure(page, 0)
    passed('confirmed reset clears only current puzzle; cancellation preserves it')

    for entry in puzzles[0]['entries']:
        choose(page, entry)
        page.get_by_role('button', name=f'Place {entry["answer"]}', exact=True).click()
    expect(page.get_by_role('dialog', name='Puzzle complete!', exact=True)).to_be_visible()
    assert solved(page) == 10
    expect(page.get_by_role('dialog')).to_contain_text('You found all 10 words')
    page.get_by_role('button', name='Next adventure', exact=False).click()
    assert solved(page) == 1
    passed('all first-puzzle answers solve; celebration and next-adventure action work')

    # Keyboard-only primary flow is available without dragging.
    adventure(page, 2)
    first = puzzles[2]['entries'][0]
    tile = page.get_by_role('button', name=f'Place {first["answer"]}', exact=True)
    tile.focus()
    page.keyboard.press('Enter')
    assert solved(page) == 1
    passed('keyboard Enter can place a selected answer')

    clean(page)
    # Complete every imported answer to verify all layouts are usable in the app.
    count = 0
    for index, puzzle in enumerate(puzzles):
        adventure(page, index)
        for entry in puzzle['entries']:
            page.get_by_role('button', name=f'Place {entry["answer"]}', exact=True).click()
            count += 1
        expect(page.get_by_role('dialog', name='Puzzle complete!', exact=True)).to_be_visible()
        assert solved(page) == len(puzzle['entries'])
        page.get_by_role('button', name='Admire my puzzle', exact=True).click()
    assert count == 110
    page.get_by_role('button', name='My progress', exact=True).click()
    expect(page.get_by_role('dialog', name='My progress')).to_contain_text('110 / 110')
    expect(page.get_by_role('dialog', name='My progress')).to_contain_text('10 / 10')
    page.get_by_role('button', name='Close dialog', exact=True).click()
    passed('all 110 answers across all 10 layouts solve and award final milestones')

    clean(page)
    page.screenshot(path='/tmp/wordsprout-desktop.png', full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    passed('desktop1440 has no horizontal overflow; clean screenshot captured')

    mobile = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
    phone = mobile.new_page()
    phone.on('pageerror', lambda error: errors.append(str(error)))
    phone.goto(url)
    expect(phone.locator('#page-heading')).to_be_visible()
    phone.get_by_role('button', name='Place MONKEY', exact=True).tap()
    assert solved(phone) == 1
    assert phone.evaluate('document.documentElement.scrollWidth <= innerWidth')
    passed('mobile390 touch-to-place works without horizontal overflow')
    adventure(phone, 9)
    assert phone.evaluate('document.documentElement.scrollWidth <= innerWidth')
    grid = phone.locator('.crossword-grid').bounding_box()
    assert grid and grid['x'] >= 0 and grid['x'] + grid['width'] <= 390
    passed('widest 17-column puzzle fits mobile390 viewport')
    clean(phone)
    phone.screenshot(path='/tmp/wordsprout-mobile.png', full_page=True)
    assert not errors, '\n'.join(errors)
    passed('no uncaught browser errors; clean mobile screenshot captured')
    browser.close()
    print(f'\n{len(checks)} browser checks passed. Screenshots: /tmp/wordsprout-desktop.png and /tmp/wordsprout-mobile.png', flush=True)
