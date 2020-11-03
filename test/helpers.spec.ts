import { toKebabCase } from "../src/helpers"

describe(toKebabCase.name, () => {
  it.each([
    ["éÉé", "e-ee"],
    ["Jules César", "jules-cesar"],
    ["Jul Saint Jean-DeLa_puenta", "jul-saint-jean-de-la-puenta"],
    ["EfreiParis", "efrei-paris"],
    ["heho", "heho"],
    ["camelCase", "camel-case"]
  ])("kebab-case %s to %s", (original: string, expected: string) => {
    expect(toKebabCase(original)).toEqual(expected)
  })
})
