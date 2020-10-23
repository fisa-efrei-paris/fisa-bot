type GenericFunction = (...args: any[]) => any

type PickByTypeKeyFilter<T, C> = {
  [K in keyof T]: T[K] extends C ? K : never
}
type KeysByType<T, C> = PickByTypeKeyFilter<T, C>[keyof T]
type ValuesByType<T, C> = {
  [K in keyof T]: T[K] extends C ? T[K] : never
}
type PickByType<T, C> = Pick<ValuesByType<T, C>, KeysByType<T, C>>
type MethodsOf<T> = KeysByType<Required<T>, GenericFunction>
type InterfaceOf<T> = PickByType<T, GenericFunction>

type PartiallyMockedInterfaceOf<T> = {
  [K in MethodsOf<T>]?: jest.Mock<InterfaceOf<T>[K]>
}

/**
 * @see https://github.com/facebook/jest/issues/7832#issuecomment-462343138
 */
export function mockInterface<T>(
  ...mockedMethods: MethodsOf<T>[]
): jest.Mocked<T> {
  const partiallyMocked: PartiallyMockedInterfaceOf<T> = {}
  mockedMethods.forEach(
    mockedMethod => (partiallyMocked[mockedMethod] = jest.fn())
  )

  return partiallyMocked as jest.Mocked<T>
}

export function mockClassInstance<T>(
  instance: new (...args: any[]) => T,
  mockInstanceProperties: (keyof T)[] = []
): jest.Mocked<T> {
  const instanceMock: { [key: string]: jest.Mock<InterfaceOf<T>> } = {}
  const prototype = instance.prototype

  do {
    for (const property of Object.getOwnPropertyNames(instance.prototype)) {
      instanceMock[property] = jest.fn().mockImplementation(() => {
        throw new Error(
          `Missing mocked return value or implementation for ${property}`
        )
      })
    }

    instance = Object.getPrototypeOf(instance)
  } while (instance.prototype)

  // Instance properties that are not part of the prototype cannot be automatically
  // detected, and consequently need to be passed manually when mocking the class
  // instance.
  for (const instanceProperty of mockInstanceProperties) {
    instanceMock[instanceProperty as string] = jest
      .fn()
      .mockImplementation(() => {
        throw new Error(
          `Missing mocked return value or implementation for instance property ${instanceProperty}`
        )
      })
  }

  instanceMock.__proto__ = prototype
  return (instanceMock as unknown) as jest.Mocked<T>
}
