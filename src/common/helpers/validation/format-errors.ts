import { ValidationError } from '@nestjs/common';

/**
 * 
 * formats the errors array into an array of `{ property: string, message: string }` format.
 * 
 * ### Example:
 * ```
 * [
    {
      "property": "gender",
      "message": "gender must be one of the following values: MALE, FEMALE, OTHERS"
    },
    {
      "property": "gender",
      "message": "gender should not be empty"
    },
    {
      "property": "settings.darkMode",
      "message": "darkMode must be a boolean value"
    }
  ],
  ```
  ## How it works
  - the 'errors' array contains errors found in each of the property from the DTO that failed the required validation
  - during each iteration, the 'error' object refers to the Validation error of a property from the DTO.
  - the 'property' key will hold the key of the DTO property that failed the validation
  
  - the 'constraints' property will contain an object containing the errors of the current property 
  ##### Example:
  ```
    "property": "gender",
    "constraints": {
      "isEnum": "gender must be one of the following values: MALE, FEMALE, OTHERS",
      "isNotEmpty": "gender should not be empty"
    })
  ```

  - the 'children' property will contain all the nested validation errors of the property
  ##### Example:
  ```
    "children": [
      {
        "target": {
          "darkMode": "some-string"
        },
        "value": "some-string",
        "property": "darkMode",
        "children": [],
        "constraints": {
          "isBoolean": "darkMode must be a boolean value"
        }
      }
    ]
  ```

  - the fullProperty path will be used to return the path of nested error properties using dot notation drilling

  - the reason behind using flatMap() is because at each level the 'currentLevelErrors' and 'nestedErrors' variable will be an array of error objects. 
  ```
  // Without flattening:
    [
      [{ "property": "name", "message": "should not be empty" }],
      [{ "property": "address.street", "message": "should not be empty" }]
    ]
  ```
  ```
  // With flattening:
    [
      { "property": "name", "message": "should not be empty" },
      { "property": "address.street", "message": "should not be empty" }
    ]
  ````

  - for each iteration that has a non empty nested validation errors (contained in the 'children' array), we recursively call the formatErrors() function with the current property path as the parentPropertyPath

  ### Example ValidationError[] payload
  ```
    [
      {
        "target": {
          "username": "leohangrai",
          "email": "raileohang2@gmail.com",
          "settings": {
            "darkMode": "some-string"
          }
        },
        "property": "gender",
        "children": [],
        "constraints": {
          "isEnum": "gender must be one of the following values: MALE, FEMALE, OTHERS",
          "isNotEmpty": "gender should not be empty"
        }
      },
      {
        "target": {
          "username": "leohangrai",
          "email": "raileohang2@gmail.com",
          "settings": {
            "darkMode": "some-string"
          }
        },
        "value": {
          "darkMode": "some-string"
        },
        "property": "settings",
        "children": [
          {
            "target": {
              "darkMode": "some-string"
            },
            "value": "some-string",
            "property": "darkMode",
            "children": [],
            "constraints": {
              "isBoolean": "darkMode must be a boolean value"
            }
          }
        ]
      }
    ]
  ```
*/
export function formatErrors(
  errors: ValidationError[],
  parentPropertyPath = '',
) {
  return errors.flatMap((error) => {
    const fullPropertyPath = parentPropertyPath
      ? `${parentPropertyPath}.${error.property}`
      : error.property;
    const currentLevelErrors = Object.keys(error.constraints || {}).map(
      (key) => ({
        property: fullPropertyPath,
        message: error.constraints[key],
      }),
    );
    const nestedErrors = error.children?.length
      ? formatErrors(error.children, fullPropertyPath)
      : [];
    return [...currentLevelErrors, ...nestedErrors];
  });
}
