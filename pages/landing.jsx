/* eslint-disable prettier/prettier */
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import Button from "../elements/Button";
import { getLandingPage } from "../utils/api";
import { getStrapiMedia } from "../utils/medias";

const Landing = ({landing}) => {

  const { session } = useSelector((state) => state);

  const [connected, setConnected] = useState(false)

  
  useEffect(() => {
    if (session) {
      setConnected(true)
      localStorage.setItem('token', JSON.stringify(session));
    } else {
      setConnected(false)
      localStorage.setItem('token', JSON.stringify(''));
    }
  }, [session])

  return (
    <div>
      <Head>
        <title>Landing Page</title>
      </Head>
      <div className="landingContainer">
        <div className="header">
          <div className="backHuge back">
            <img src="/header2k.png" alt="background" className='background'/>
          </div>
          <div className="back">
            <img src="/headerBackgroundTest.png" alt="background" className='background'/>
          </div>
          <div className="backMobile">
            <img src="/headerBackround23.png" alt="background" className='background'/>
          </div>
          <h1>{landing.title} </h1>
          <p className="subtitle">{landing.subtitle} </p>
        </div>
        {/* <h2 className="h1">Comment marche la location de mangas ?</h2> */}
        <div className="collectorPart">
          <h2 className="h1">{landing.titleCollector} </h2>
          <p className="explanation" dangerouslySetInnerHTML={{__html: landing.explanationCollector}}></p>
          <p className="tips" dangerouslySetInnerHTML={{__html: landing.tipsCollector}}></p>
          <div className="cardsContainer">
            {landing.cardsCollector.map((card, key) => {
              return (
                <div className="card" key={key}>
                  <img src={getStrapiMedia(card.image[0].url)} alt="online"/>
                  <h3 dangerouslySetInnerHTML={{__html: card.titleCard}}></h3>
                  <p dangerouslySetInnerHTML={{__html: card.descriptionCard}}></p>
                </div>
              )
            })}
          </div>
          <div className="buttonContainer">
            <Link href={connected ? "/create/product" : "/login"}>
              <a>
                <Button color={'Red'}>Déposer une annonce</Button>
              </a>   
            </Link>
            <Link href={{pathname: "/becomeCollector", query: { scroll: "simulateur" }}}>
            {/* <Link href={"/becomeCollector#simulateur"}> */}
              <a>
                <Button color={'White'}>Simuler mes revenus</Button>
              </a>   
            </Link>
          </div>
        </div>
        <div className="readerPart">
          <img src="separation1.png" alt="" className="separation separation1" />
          <img src="separation2.png" alt="" className="separation separation2" />
          <h2 className="h1">{landing.titleReader} </h2>
          <p className="explanation" dangerouslySetInnerHTML={{__html: landing.explanationReader}}></p>
          <p className="tips" dangerouslySetInnerHTML={{__html: landing.tipsReader}}></p>
          <div className="cardsContainer">
            {landing.cardsReader.map((card, key) => {
              return (
                <div className="card" key={key}>
                  <img src={getStrapiMedia(card.image[0].url)} alt="online"/>
                  <h3 dangerouslySetInnerHTML={{__html: card.titleCard}}></h3>
                  <p dangerouslySetInnerHTML={{__html: card.descriptionCard}}></p>
                </div>
              )
            })}
          </div>
          <div className="buttonContainer">
            <Link href="/">
              <a>
                <Button color={'Red'}>Louer une collection</Button>
              </a>
            </Link>
          </div>
        </div>
        <div className="insurancePart">
          <h2 className="h1">{landing.titleInsurance} </h2>
          <p className="explanation" dangerouslySetInnerHTML={{__html: landing.explanationInsurance}}></p>
          <p className="tips" dangerouslySetInnerHTML={{__html: landing.tipsInsurance}}></p>
          <div className="cardsContainer">
            {landing.cardsInsurance.map((card, key) => {
              return (
                <div className="card" key={key}>
                  <img src={getStrapiMedia(card.image[0].url)} alt="online"/>
                  <h3 dangerouslySetInnerHTML={{__html: card.titleCard}}></h3>
                  <p dangerouslySetInnerHTML={{__html: card.descriptionCard}}></p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const landing = await getLandingPage();
  return { props: { landing } };
}

export default Landing;
