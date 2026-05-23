"""
This module contains step definitions for web.feature.
It uses Selenium WebDriver for browser interactions:
https://www.seleniumhq.org/projects/webdriver/
Setup and cleanup are handled in environment.py
For a real test automation project,
use Page Object Model or Screenplay Pattern to model web interactions.
"""
from tunevault.models import User
from behave import *
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By

# "Constants"

TUNEVAULT_HOME = 'http://127.0.0.1:8000/login'


# Givens

@given('the Sign In page is displayed')
def step_impl(context):
    pass

# Whens

@when('the user inserts "{phrase}" as username')
def step_impl(context, phrase):
       context.username = phrase




@when('the user inserts "{phrase}" as password')
def step_impl(context, phrase):
        context.password = phrase

# Thens


@then('the user should be redirected to the users settings as it is his first time in the website')
def step_impl(context):
    found = User.objects.get(pk=25)
    assert context.password == found.password and context.username == found.username
    assert found, f"Expected to get the user credentials from database, but didn't find them."
