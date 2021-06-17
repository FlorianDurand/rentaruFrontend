/* eslint-disable prettier/prettier */
import Head from "next/head";
import Dropdown from "../elements/DropDown";
import { useEffect, useState } from "react";
import { getFaqPage } from "../utils/api";

const Faq = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [faq, setFaq] = useState()

  useEffect(() => {
    getFaqPage().then((resp) => {
      setFaq(resp)
    })
  }, [])

  if (!faq) return 'Loading.....'
  return (
    <div>
      <Head>
        <title>Foire aux questions</title>
      </Head>
      <div className="container">
        <h1 className="h1">{faq.title}</h1>
        <div className="row">
          <div className="left">
            {faq.theme.map((question, index) => {
              return (
                <div className={`theme ${index === selectedIndex ? 'selected' : ''}`} onClick={() => setSelectedIndex(index)}>{question.questionTheme}</div>
              )
            })}
          </div>
          <div className="right">
            {faq.theme[selectedIndex].question.map((soloQuestion, index) => {
              return (
                <Dropdown key={`${soloQuestion.titleQuestion}-${index}`} title={soloQuestion.titleQuestion} color="Dark">
                  <p dangerouslySetInnerHTML={{__html: soloQuestion.answerQuestion}}></p>
                </Dropdown>
              )
            })}
          </div>
        </div>
    </div>
    </div>
  );
};

export default Faq;
