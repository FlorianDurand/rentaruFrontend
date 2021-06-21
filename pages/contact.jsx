/* eslint-disable prettier/prettier */
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import emailjs from 'emailjs-com'
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";

const Contact = ({apiKeys, captchaKey}) => {

  const recaptchaRef = useRef(null);
  
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [mail, setMail] = useState('');
  const [object, setObject] = useState('');
  const [message, setMessage] = useState('');
  const [submitMessage, setSubmitMessage] = useState('')
  const [captchaValidated, setCaptchaValidated] = useState(false);

  useEffect(() => {
    const form = document.querySelector('.form')
    form.addEventListener('submit',sendEmail)
  }, []);

  const sendEmail = e => {
    e.preventDefault()
    emailjs
    .sendForm(apiKeys.SERVICE_ID, apiKeys.TEMPLATE_ID, e.target, apiKeys.USER_ID)
    .then(
      result => {
        console.log(result.text)
        setSubmitMessage('Sucess')
      },
      error => {
        setSubmitMessage('Error')
        console.log(error.text)
      }
    )
    setLastName('');
    setFirstName('');
    setMail('');
    setObject('');
    setMessage('');
    setCaptchaValidated(false)
    recaptchaRef.current.reset()
  }

  return (
    <div>
      <Head>
        <title>Contact</title>
      </Head>
      <div className="contactContainer">
        <h1 className="h1">Contact</h1>
        <form action="" method='POST' className="form formContainer">
          <p>Pour toute demande, remplir le formulaire ci-dessous.</p>
          <div className="inputsWrapper">
            <div>
              <input name={'firstName'} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='Prénom'></input>
              <input name={'lastName'} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder='Nom'></input>
            </div>
            <div>
              <input name={'mail'} value={mail} onChange={(e) => setMail(e.target.value)} placeholder='Mail'></input>
              <input name={'object'} value={object} onChange={(e) => setObject(e.target.value)} placeholder='Objet'></input>
            </div>
          </div>
          <textarea name={'message'} value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Message'></textarea>
          <ReCAPTCHA
            sitekey={captchaKey}
            onChange={() => setCaptchaValidated(true)}
            theme="dark"
            ref={recaptchaRef}
          />
          <input type='submit' className="submit" value='Envoyer' disabled={!captchaValidated}></input>
        </form>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const apiKeys = {SERVICE_ID: '', TEMPLATE_ID: '',USER_ID: ''}
  apiKeys.SERVICE_ID = process.env.APIKEYS_SERVICE_ID;
  apiKeys.TEMPLATE_ID = process.env.APIKEYS_TEMPLATE_ID;
  apiKeys.USER_ID = process.env.APIKEYS_USER_ID;
  const captchaKey = process.env.RECAPTCHA_GOOGLE_KEY;
  return { props: { apiKeys, captchaKey } };
}

export default Contact;
