/**
 * Extracts the `$project` properties of a model/schema
 *
 * ### Warning:
 * - Choosing a mix of `true` and `false` values will result in a runtime error.
 * - Setting the `_id` property to `false` will result in the populated field to be `null`.
 *
 * #### NOTE:
 * After creating this generic type, I found out that mongoose already has a generic type for this called `ProjectionType` which can be used as:
 * ```
 *  type UserProjection = mongoose.ProjectionType<User>
 * ```
 * where `User` is the model/schema.
 *
 * **_But the problem with this mongoose type is that although it provides type/key suggestions, it is very losely typed and does not provide any type checking for the fields (accepts any arbitrary key), which might lead to runtime errors or some unexpected behaviors._**
 *
 * #### Example projection:
 * For the following model:
 * ```
 *  User {
 *    username: string;
 *    email: string;
 *    gender: Gender;
 *    profilePic: string;
 *    settings: UserSettings;
 *    posts: Post[];
 *  }
 * ```
 * The type returned will be:
 * ```
 *  {
 *    username?: boolean;
 *    email?: boolean;
 *    gender?: boolean;
 *    profilePic?: boolean;
 *    settings?: boolean;
 *    posts?: boolean;
 *  }
 * ```
 */
export type ProjectionFieldsOf<T> = Partial<{
  [K in keyof T]: boolean;
}>;
