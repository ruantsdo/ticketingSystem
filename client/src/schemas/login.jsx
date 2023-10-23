import * as yup from "yup"

const loginSchema = yup.object().shape({
  email:yup
    .string()
    .email("Não é um email válido")
    .required("Este campo é obrigatório!"),
  password:yup
    .string()
    .min(3, "A senha deve ter pelo menos 3 caracteres!")
    .required("Este campo é obrigatório!"),
});

export default loginSchema