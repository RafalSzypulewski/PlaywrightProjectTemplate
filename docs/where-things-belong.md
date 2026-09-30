# Where things belong

| Belongs in           | When                                                                                   | Test                                           |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Page Object**      | One screen or route: its URL, unique elements and business flows                       | Would this only make sense on this page?       |
| **Component Object** | A UI piece repeated on a page or across pages, with several related elements/behaviors | Is there a second place I would copy-paste it? |
| **Fixture**          | Setup, teardown or wiring: page objects, logged-in state, data with cleanup, `env`     | Must it be created before and cleaned after?   |
| **Utility**          | Pure logic with no Page/Locator/test state (formatting, parsing, random data)          | Does it work with no Playwright object?        |

Rules:

- A component must earn its existence: more than one element and more than one place. A single
  button or field stays a locator property on the page.
- Components take a `Locator` root, never a `Page`. Pages compose components as properties.
- No `BaseComponent`, no component inheritance.
- Assertions stay in specs; components expose locators and business actions.
