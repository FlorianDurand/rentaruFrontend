/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts, getProduct, postCommande, updateProduct } from "../../utils/api";
import Moment from 'moment';
import 'moment/locale/fr'
import { extendMoment } from 'moment-range';
import { getStrapiMedia } from "../../utils/medias";
import CheckBox from "../../elements/CheckBox";
import Radio from "../../elements/Radio";
import Link from "next/link";
import PaiementStripe from "../../components/paiementStripe" 
import {updateMe} from '../../store'

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";


const PaiementPage = ({ product, stripeKey }) => {

  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading product...</div>;
  }

  const stripePromise = loadStripe(stripeKey);

  const moment = extendMoment(Moment);
  const dispatch = useDispatch();

  const { rent, user, session } = useSelector((state) => state);

  // const [delivery, setDelivery] = useState(product.delivery === 'Remise en main propre' || product.delivery === 'Indifférent' ? 'Remise en main propre' : 'Livraison Mondial Relay');
  const [delivery, setDelivery] = useState('Remise en main propre');
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [cglAccepted, setCglAccepted] = useState(false);
  const [price, setPrice] = useState(product.price)
  const [deliveryWording, setDeliveryWording] = useState()
  const [useCagnotte, setUseCagnotte] = useState(false)
  
  useEffect(() => {
    if(delivery === 'Livraison Mondial Relay') {
      setDeliveryPrice(13);
      setDeliveryWording('mondialRelay')
    }
    else if(delivery === 'Livraison Colissimo') {
      setDeliveryPrice(20);
      setDeliveryWording('colissimo')
    }
    else {
      setDeliveryPrice(0);
      setDeliveryWording('handToHand');
    }
  },[delivery])

  useEffect(() => {
    if (product.delivery === 'Remise en main propre' || product.delivery === 'Indifférent') setDelivery('Remise en main propre')
    // else setDelivery('Livraison Mondial Relay')
  }, [product.user.handToHand])

  useEffect(() => {
    if (rent.startDate && rent.endDate) {
      const range =  moment.range(rent.startDate, rent.endDate)
      const days = range.diff('days')+1;
      if (days > 14) {
        setPrice(((days-14)*0.05+1)*product.price)
      } else if (days < 14) {
        setPrice((1-((14-days)*0.05))*product.price)
      } else {
        setPrice(product.price)
      }
    }
  }, [rent.startDate, rent.endDate])

  useEffect(() => {
    if (useCagnotte && user.cagnotte < price*1.1+0.2) {
      setUseCagnotte(false)
    }
  }, [useCagnotte])

  const go = (stripeToken) => {

    if ((stripeToken || (useCagnotte && user.cagnotte > (price*1.1+0.2))) && cglAccepted) {
      postCommande(product.id, user.id, user.stripeId, product.user.id, rent.startDate, rent.endDate, price, (price*1.1+0.2), deliveryPrice, deliveryWording, stripeToken ? stripeToken.token.id : '', useCagnotte, session).then((resp) => {
        if (useCagnotte) {
          const data = {cagnotte: user.cagnotte - (price*1.1+0.2)}
          dispatch(updateMe(data, session))
        }
        updateProduct(product.id, {booked : rent.bookings}, session).then(() => router.push(`/`))
      })
    }
  }

  const goBack = () => {
    router.push(`/products/${product.slug}`)
  }

  return (
    <div className="paiementPage">
      
      <Head>
        <title>Rent Page paiement </title>
      </Head>
      <div className="leftContent">
        <div className="title">
          <img src="/bigArrow.svg" alt="arrow" onClick={goBack}/>
          <h2>Confirmez et payez</h2>
        </div>
        <div className="rentInfo">
          <h3>Votre location</h3>
          <div className="date">
            <div className="headerDate">
              <p className="label">Dates</p>
              <button className="editBtn" onClick={goBack}>Modifier</button>
            </div>
            <p className="dateNumber">{moment(rent.startDate).format('Do MMMM')}-{moment(rent.endDate).format('Do MMMM')}</p>
          </div>
          <div className="prices">
            {/* {product.delivery !== 'Envoi postal' && ( */}
              <div className="price">
                <div className="leftPart">
                  <Radio checked={delivery === 'Remise en main propre'} setChecked={setDelivery} info={'Remise en main propre'} resetInfo={''} />                
                  <p className="label">Remise en main propre</p>
                </div>
                <p className="priceNumber">0,00 €</p>
              </div>
            {/* )} */}
            {/* <div className="price">
              <div className="leftPart">
                <CheckBox checked={delivery === 'Relais colis'} setChecked={setDelivery} info={'Relais colis'} resetInfo={''} />  
                <p className="label">Relais colis</p>
              </div>
              <p className="priceNumber">0,00 €</p>
            </div> */}
            {product.delivery !== 'Remise en main propre' && (
              <>
                <div className="price">
                  <div className="leftPart">
                    <Radio checked={delivery === 'Livraison Mondial Relay'} setChecked={() => null} info={'Livraison Mondial Relay'} resetInfo={''} />  
                    <p className="label">Livraison Mondial Relay</p>
                  </div>
                  <p className="priceNumber">bientôt disponible</p>
                </div>
                <div className="price">
                  <div className="leftPart">
                    <Radio checked={delivery === 'Livraison Colissimo'} setChecked={() => null} info={'Livraison Colissimo'} resetInfo={''} /> 
                    <p className="label">Livraison Colissimo</p>
                  </div>
                  <p className="priceNumber">bientôt disponible</p>
                </div>
              </>
            )}
          </div>
          {rent.startDate && rent.endDate && (
            <div className="creditCard">
              <div className="title">
                <h2>Paiement sécurisé avec :</h2>
                <div className="imagesPayement">
                  <img src="/stripe-logo-blue.png" alt="stripe"/>
                </div>
              </div>
              <div className="cagnotte">
                <div className="left">
                  <Radio checked={useCagnotte} setChecked={setUseCagnotte} info={true} resetInfo={false} />
                  <img src="/bank.svg" alt="pièce d'or" />
                  <div className="body">Mon porte-monnaie Rentaru</div>
                </div>
                <div className="solde">{new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format(user.cagnotte)}</div>
              </div>
              <Elements stripe={stripePromise}>
                <PaiementStripe cglAccepted={cglAccepted} go={go} checked={!useCagnotte} setChecked={setUseCagnotte} info={false} resetInfo={true}>
                  <div className="acceptCGL">
                    <CheckBox checked={cglAccepted} setChecked={setCglAccepted} info={true} resetInfo={false} />
                      <p onClick={() => setCglAccepted(!cglAccepted)}>En cochant cette case vous acceptez les <span className="underline" onClick={e => e.stopPropagation()}><Link href="/CGL" >CGL</Link></span></p>
                  </div>
                </PaiementStripe>
              </Elements>
            </div>
          )}
        </div>
      </div>
      <div className="rightContent">
        <div className="card">
          <img src={product.manga_api.cover ? getStrapiMedia(product.manga_api.cover.url) : '/cuteCat.svg'} alt="cover"/>
          <div className="productInfo">
            <h2>{product.title}</h2>
            <p className='tomes'> Tome {product.tomeInitial} à {product.tomeFinal}</p>
            <p className="subtitle">Détails du prix</p>
            <div className="price">
              <p>Comission collectionneur</p>
              <p>{new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format(price)}</p>
            </div>
            <div className="price">
              <p>Frais de service</p>
              <p>{new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format(price*0.1+0.2)}</p>
            </div>
            <div className="price">
              <p>{delivery}</p>
              <p>{new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format(deliveryPrice)}</p>
            </div>
            <div className="priceTotal">
              <p>Total (EUR)</p>
              <p>{new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format(price*1.1+0.2 + deliveryPrice)}</p>
            </div>
          </div>
        </div>
        <div className="bullshit">
          <div className="condition">
            <h3>Condition d’annulation :</h3>
            <p>Si vous devez annuler, merci de prévenir dans les temps, en respectant les délais d'annulation. Pour plus d’informations merci de consulter les CGL</p>
          </div>
          <div className="caution">
            <h3>Caution</h3>
            <p>La caution s'engage à la demande du débiteur avec lequel elle est liée par un contrat de garantie. Elle garantit au collectionneur qu'il sera remboursé en cas de défaut. Le cautionnement bancaire est fourni par des sociétés spécialisées sécurisées.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaiementPage;

export async function getStaticProps({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return {  redirect: {
    destination: '/404',
    permanent: false
  }}
  const stripeKey = process.env.STRIPE_PK
  return { props: { product, stripeKey } };
}

export async function getStaticPaths() {
  const products = await getProducts();
  return {
    paths: products.map((_product) => {
      return {
        params: { slug: _product.slug },
      };
    }),
    fallback: false,
  };
}
