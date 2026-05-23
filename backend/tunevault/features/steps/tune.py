
from behave import *
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC




# Givens

@given('the Sign In page is displayed')
def step_impl(context):
    context.browser.get('http://127.0.0.1:8000/login/')


# Whens

@when('the user inserts his credentials')
def step_impl(context):
    pass
# Thens


@then('he should be inside his account')
def step_impl(context):
    try:
        WebDriverWait(context.browser, 15).until(EC.url_changes('http://127.0.0.1:8000/login/'))
        assert True
    except:
        assert False
