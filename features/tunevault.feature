@tunevault
Feature: Tunevault Sign In Service
    As a user
    I want to log into my account
    So I can with the forums based on my interests

 Scenario: Basic sign in verification
    Given the Sign In page is displayed
    When the user inserts "papaya" as username
    And the user inserts "papayapassword1" as password
    Then the user should be redirected to the users settings as it is his first time in the website
    Feature: Tunevault Sign In Service
    As a user
    I want to log into my account
    So I can with the forums based on my interests

 Scenario: Basic sign in verification
    Given the Sign In page is displayed
    When the user inserts "papaya" as username
    And the user inserts "papayapassword1" as password
    Then the user should be redirected to the user's settings as it is his first time in the website
    When the user inserts "nuevousuario" as username
    And the user inserts "usuariopass" as password
    Then the users should see a message that says "Invalid username or password"

