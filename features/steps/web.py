"""
This module contains step definitions for web.feature.
It uses Selenium WebDriver for browser interactions:
https://www.seleniumhq.org/projects/webdriver/
Setup and cleanup are handled in environment.py
For a real test automation project,
use Page Object Model or Screenplay Pattern to model web interactions.
"""

from behave import *
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By

# "Constants"

DUCKDUCKGO_HOME = 'https://duckduckgo.com/'


# Givens

@given('the Google home page is displayed')
def step_impl(context):
    context.browser.get(DUCKDUCKGO_HOME)


# Whens

@when('the user searches for "{phrase}"')
def step_impl(context, phrase):
    pass



@when('the user searches for the phrase')
def step_impl(context):
    search_input = context.browser.find_element(By.ID,'searchbox_input')
    search_input.send_keys(context.text + Keys.RETURN)

# Thens




@then('results are shown for "{phrase}"')
def step_impl(context, phrase):
    result_divs = context.browser.find_elements(By.CSS_SELECTOR,'.ikg2IXiCD14iVX7AdZo1')
    print(result_divs)
    found=False
    for result in result_divs:
        print(result.text)
        if phrase.lower() in result.text.lower():
            found=True
            break
    assert found, f"Expected '{phrase}' in result, but didn't find it."
