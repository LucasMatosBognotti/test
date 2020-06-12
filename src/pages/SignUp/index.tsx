import React, {useCallback, useRef} from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  View,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Form} from '@unform/mobile';
import {FormHandles} from '@unform/core';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';

import api from '../../services/api';

import Input from '../../components/Input';
import Button from '../../components/Button';

import getValidationErrors from '../../utils/getValidationErrors';

import logoImg from '../../assets/logo.png';

import {Container, Title, BackToSignIn, BackToSignInText} from './styles';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      formRef.current?.setErrors({});
      console.log(data);
      try {
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatorio'),
          email: Yup.string()
            .email('Digite um e-mail válido')
            .required('E-mail é obrigatorio'),
          password: Yup.string().required('Senha obrigatoria'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await api.post('users', data);

        Alert.alert(
          'Cadastro realizado com successo',
          'Voce ja pode fazer login na aplicação',
        );

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }

        Alert.alert(
          'Error no cadastro',
          'Ocorreu um erro ao fazer o cadastro, cheque as credenciais.',
        );
      }
    },
    [navigation],
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{flex: 1}}>
          <Container>
            <Image source={logoImg} />

            <View>
              <Title>Crie sua conta</Title>
            </View>

            <Form ref={formRef} onSubmit={handleSignUp}>
              <Input
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
                name="name"
                icon="user"
                placeholder="Nome completo"
              />

              <Input
                ref={emailInputRef}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
                name="email"
                icon="mail"
                placeholder="E-mail"
              />

              <Input
                ref={passwordInputRef}
                secureTextEntry
                returnKeyType="send"
                textContentType="newPassword"
                onSubmitEditing={() => formRef.current?.submitForm()}
                name="password"
                icon="lock"
                placeholder="Senha"
              />

              <Button onPress={() => formRef.current?.submitForm()}>
                Cadastrar
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
      <BackToSignIn onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={20} color="#FFF" />
        <BackToSignInText>Já tenho uma conta</BackToSignInText>
      </BackToSignIn>
    </>
  );
};

export default SignUp;
