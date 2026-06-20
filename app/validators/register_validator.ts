import vine from "@vinejs/vine";

export const registerValidator = vine.compile(
  vine.object({
    fullname: vine
      .string()
      .trim()
      .minLength(3),

    username: vine
      .string()
      .trim()
      .minLength(3),

    email: vine
      .string()
      .trim()
      .email(),

    password: vine
      .string()
      .minLength(8),
  })
)