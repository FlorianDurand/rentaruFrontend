/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable prettier/prettier */
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProductsList from "../../components/ProductsList";
import { getUsers, getUser } from "../../utils/api";
import { getStrapiMedia } from "../../utils/medias";

const UserPage = ({ user }) => {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading user...</div>;
  }
  

  const [windowWidth, setWindowWidth] = useState(1281);
  const [memberSince, setMemberSince] = useState('');
  const [ongletSelected, setOngletSelected] = useState('Collection');


  const calculDate = () => {
    const now = Date.now();
    const currentDate = now - new Date(user.created_at);
    setMemberSince(Math.trunc(currentDate/1000/60/60/24))
  }

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    calculDate()
  }, [])

  const updateSize = () => {
    setWindowWidth(window.innerWidth)
  }

  return (
    <div>
    <Head>
      <title>{user.username}</title>
    </Head>
    <div className="userContainer">
      <div className="contentTop">  
        <div className="infoProfil">
          {true && (
            <div className="badgePurple">
              <img src="/certif.svg" alt="book"/>
              <p>Grand Senseï</p> 
            </div>
          )}
          <div className="infos">
            <img className='profilPic' src={getStrapiMedia(user.profilPic?.url)} alt="profil picture"/>
            <h2>{user.username}</h2>
            <p>📍 {user.ville} ({user.departement[0]}{user.departement[1]})</p>
            <div className="reviews">
              <div className="stars">
                {
                [1,2,3,4,5].map((el, index) => {
                  return (
                    <svg width="6" height="5" viewBox="0 0 6 5" fill="none" xmlns="http://www.w3.org/2000/svg" key={index} className={index < user.note ? 'starFill' : 'starEmpty'}>
                      <path d="M2.19947 0.463526C2.34915 0.0028702 3.00085 0.0028702 3.15053 0.463526L3.38783 1.19387C3.45477 1.39988 3.64675 1.53936 3.86336 1.53936H4.63129C5.11565 1.53936 5.31704 2.15917 4.92518 2.44387L4.30391 2.89525C4.12867 3.02257 4.05534 3.24825 4.12228 3.45427L4.35958 4.18461C4.50926 4.64527 3.98202 5.02833 3.59016 4.74363L2.96889 4.29225C2.79365 4.16493 2.55635 4.16493 2.38111 4.29225L1.75984 4.74363C1.36798 5.02833 0.840741 4.64527 0.990417 4.18461L1.22772 3.45427C1.29466 3.24825 1.22133 3.02257 1.04609 2.89525L0.424816 2.44387C0.0329596 2.15917 0.234347 1.53936 0.718709 1.53936H1.48664C1.70325 1.53936 1.89523 1.39988 1.96217 1.19387L2.19947 0.463526Z" fill="white"/>
                    </svg>
                  )                    
                })}
              </div>
              <button>Voir les avis</button>
            </div>
            <div className="confirmed">
              <div className="confirmation">
                <img src="/checkmark.png" alt="checkmark"/>
                <p className='elementConfirmed'>Remise en main prope</p>
              </div>
              <div className="confirmation">
                <img src="/checkmark.png" alt="checkmark"/>
                <p className='elementConfirmed'>Carte d’identité vérifiée</p>
              </div>
              <div className="confirmation">
                <img src="/checkmark.png" alt="checkmark"/>
                <p className='elementConfirmed'>Adresse mail vérifiée</p>
              </div>
            </div>
          </div>
          <div className="msgBtn">
            <button className='button buttonRed'>Envoyer un message</button>
          </div>
        </div>
        <div className="centerContent">
          <div className="rewards">
            <div className="cardReward">
              <img src="/book.svg" alt="book"/>
              <div className="infoReward">
                <p className='number'>{user.products.length}</p>
                <p className='title'>Série{user.products.length > 1 ? 's' : ''} de manga mise{user.products.length > 1 ? 'nt' : ''} en location</p>
              </div>
            </div>
            <div className="cardReward">
              <img src="/transaction.svg" alt="transaction"/>
              <div className="infoReward">
                <p className='number'>{user.commandes && user.ownerCommandes ? user.commandes?.length + user.ownerCommandes?.length : "..."}</p>
                <p className='title'>Transactions réalisés</p>
              </div>
            </div>
            <div className="cardReward">
              <img src="/clock.svg" alt="transaction"/>
              <div className="infoReward">
                <p className='number'>{memberSince}</p>
                <p className='title'>Jour{memberSince > 1 ? 's' : ''} d'ancienneté</p>
              </div>
            </div>
          </div>
          <div className="description">
            <p className='title'>Description</p>
            <p className='descriptionContent' dangerouslySetInnerHTML={{__html: user.description}}></p>
          </div>
          {windowWidth >= 600 &&
            <div className="top">
              <h3>Le top 5 de <span>{user.username}</span></h3>
            </div>
          }
        </div>
        <div className="rightContent">
          {windowWidth >= 600 && <img src="/pub.jpg" alt="pub"/>}
          <div className="reviews">
            <p className="title">Dernier avis</p>
            <div className="review">
            WIP: Fonctionnalité à venir. See you soon. XoXo
            </div>
          </div>
        </div>
      </div>
      <div className="library">
        <div className="header">
          <div className="onglets">
            <h3 className={ongletSelected === 'Collection' ? 'selected' : ''} onClick={() => setOngletSelected('Collection')}>Collection</h3>
            <h3 className={ongletSelected === 'Lues' ? 'selected' : ''} onClick={() => setOngletSelected('Lues')}>Séries lues</h3>
          </div>
          {/* <div className="filters">
            <p>Trier par</p>
          </div> */}
        </div>
        <ProductsList products={user.products} user={user}/>
      </div>
    </div>
  </div>
  );
};

export default UserPage;

export async function getStaticProps({ params }) {
  const user = await getUser(params.id);
  if (!user) return {  redirect: {
    destination: '/404',
    permanent: true
  }}
  return { props: { user } };
}

export async function getStaticPaths() {
  const users = await getUsers();
  return {
    paths: users.map((_user) => {
      return {
        params: { id: _user.id.toString() },
      };
    }),
    fallback: false,
  };
}
