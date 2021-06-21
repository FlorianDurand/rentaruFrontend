/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/rules-of-hooks */
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

// Date
import { DateRangePicker } from 'react-dates';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import 'moment/locale/fr'
import 'react-dates/lib/css/_datepicker.css';

import { useDispatch, useSelector } from "react-redux";
import { paiementData, updateMe } from "../../store";
import ProductsList from "../../components/ProductsList";
import { getProducts, getProduct, getProductsByCategory, getProductsByTitle } from "../../utils/api";
import { getStrapiMedia } from "../../utils/medias";
import Link from "next/link";

const ProductPage = ({ productSlug, productsCategory, productsTitle}) => {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const moment = extendMoment(Moment);
  const dispatch = useDispatch();

  const state = useSelector((state) => state);
  const { session } = state;
  const me = state.user

  
  const refCards = useRef(null);
  
  const refSliderImgVisible = useRef(null);
  
  const [windowWidth, setWindowWidth] = useState(1281);
  
  const [product, setProduct] = useState()
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [focusedInput, setFocusedInput] = useState()
  const [bookings, setBookings] = useState()
  const [price, setPrice] = useState()
  const [time, setTime] = useState('/2 semaines')
  const [error, setError] = useState(false)
  const [likeIds, setLikeIds] = useState([])

  const [sliderImageVisible, setSliderImageVisible] = useState(0);

  const isBlocked = (date) => {
    let bookedRanges = [];
    let blocked;
    
    bookings.map(booking => {
      bookedRanges = [...bookedRanges, 
      moment.range(booking.startDate, booking.endDate)]
     }
    );
  blocked = bookedRanges.find(range => range.contains(date));
  return blocked;
  };

  useEffect(() => {
    if (me.likes) {
       let likeId = [];
      me.likes.forEach((like) => {
        likeId.push(like.id)
      })
      setLikeIds(likeId)
    }
  }, [me])

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', updateSize);

    getProduct(productSlug).then((resp) => {
      setProduct(resp)
    })
  }, []);

  useEffect(() => {
    if (product) {
      setPrice(product.price*1.1+0.2)
      setBookings(product.booked ?? [])
    }
  }, [product])

  useEffect(() => {
    if (startDate && endDate) {
      const range =  moment.range(startDate, endDate)
      const days = range.diff('days')+1;
      if (days > 14) {
        setPrice(((days-14)*0.05+1)*product.price*1.1+0.2)
      } else if (days < 14) {
        setPrice((1-((14-days)*0.05))*product.price*1.1+0.2)
      } else {
        setPrice(product.price*1.1+0.2)
      }
      setTime(`/${days} jours`)
    }
  }, [startDate, endDate])

  useEffect(() => {
    if (product && product.booked && product.booked.length > 0) {
      setBookings(product.booked)
    }
  }, [product])

  useEffect(() => {
    if(refSliderImgVisible.current) {
      refSliderImgVisible.current.style.left = "0px";
    }
  }, [sliderImageVisible])

  const updateSize = () => {
    setWindowWidth(window.innerWidth)
  }

  const goToPaiement = () => {
    if (product.user.username === me.username) return;
    // if (startDate && endDate) {
    //   setBookings([...bookings, {startDate, endDate}])
    //   const newBookings = [...bookings, {startDate: startDate.toDate(), endDate: endDate.toDate()}]
    //   dispatch(paiementData(newBookings, startDate.toDate(), endDate.toDate()))
    //   router.push(`/paiement/${product.slug}`)
    // } else {
    //   setError('Veuillez renseigner des dates svp')
    // }
    setError('Mode Béta paiement indisponible pour le moment'); // BETA
  }

  const handleSliderMovement = (sens) => {
    if(sens === 'left' && refSliderImgVisible.current) {
      refSliderImgVisible.current.style.left = "100%";
      setSliderImageVisible(sliderImageVisible - 1);
    }
    if(sens === 'right' && refSliderImgVisible.current) {
      refSliderImgVisible.current.style.left = "-100%";
      setSliderImageVisible(sliderImageVisible + 1);
    }
  }

  const like = (id) => {

    let data;

    if (likeIds.includes(id)) {
      const index = likeIds.findIndex((likeId) => likeId === id)
      if (index !== -1) {
        const tempLikeIds = likeIds
        tempLikeIds.splice(index, 1)
        
        data = {
          likes: tempLikeIds
        }

        setLikeIds(tempLikeIds)
      }
    } else {
      data = {
        likes: [...likeIds, id]
      }
      setLikeIds([...likeIds, id])
    }

    dispatch(updateMe(data, session))
  }

  if (!product) {
    return <div>Loading product...</div>;
  }
  return (
    <div className="productPage">
      <Head>
        <title>{product.title} announce</title>
      </Head>
      <div className="mainContent">
        <div className="leftContent">
          <div className="images">
            {product.integrale && 
              <div className="badgeSilver">
                <img src="/book2.svg" alt="book"/>
                Intégrale
              </div>
            }
            {windowWidth < 600 &&
              <div className="mobileImages">
                {sliderImageVisible !== 0 && <img onClick={() => handleSliderMovement('left')} src="/sliderArrow.svg" alt="arrow" className="leftArrow"/>}
                {product.images && product.images.map((image, index) => {
                  if(index < 3) {
                    return (
                      <img
                        ref={sliderImageVisible === index ? refSliderImgVisible : null}
                        className={index === 0 ? 'mobileImage mobileImageFirst' : 'mobileImage'}
                        src={getStrapiMedia(image.url)}
                        alt={image.alternativeText}
                      />
                    )
                  }
                  else {
                    return null;
                  }
                })}
                {product.images && sliderImageVisible < product.images.length - 1 && <img onClick={() => handleSliderMovement('right')} src="/sliderArrow.svg" alt="arrow" className="rightArrow"/>}
              </div>
            } 
            {product.images && windowWidth >= 600 &&
            <img
              className={product.images && product.images.length > 1 ? 'bigImage' : 'bigImage bigImageAlone'}
              src={getStrapiMedia(product.images[0] ? product.images[0].url : null)}
              alt={product.images[0] ? product.images[0].alternativeText : 'Ajoutez une photo svp'}
            />
            }
            {windowWidth >= 600 &&
            <div className={product.images && product.images.length > 2 ? "otherImg" : "otherImg otherImgAlone"}>
              {product.images && product.images.map((image, index) => {
                if(index !== 0 && index < 3) {
                  return (
                    <img
                      src={getStrapiMedia(image.url)}
                      alt={image.alternativeText}
                    />
                  )
                }
                else {
                  return null;
                }
              })}
            </div>
            }
          </div>
          <div className="info">
            <div className="titleInfo">
              <div>
                <h4 className="title">
                  {product.title}
                </h4>
                <div className="tome">Tome {product.tomeInitial} à {product.tomeFinal}</div>
              </div>
              <div className="stars">
                {
                [1,2,3,4,5].map((el, index) => {
                  return (
                    <svg width="6" height="5" viewBox="0 0 6 5" fill="none" xmlns="http://www.w3.org/2000/svg" key={index} className={index < product.note ? 'starFill' : 'starEmpty'}>
                      <path d="M2.19947 0.463526C2.34915 0.0028702 3.00085 0.0028702 3.15053 0.463526L3.38783 1.19387C3.45477 1.39988 3.64675 1.53936 3.86336 1.53936H4.63129C5.11565 1.53936 5.31704 2.15917 4.92518 2.44387L4.30391 2.89525C4.12867 3.02257 4.05534 3.24825 4.12228 3.45427L4.35958 4.18461C4.50926 4.64527 3.98202 5.02833 3.59016 4.74363L2.96889 4.29225C2.79365 4.16493 2.55635 4.16493 2.38111 4.29225L1.75984 4.74363C1.36798 5.02833 0.840741 4.64527 0.990417 4.18461L1.22772 3.45427C1.29466 3.24825 1.22133 3.02257 1.04609 2.89525L0.424816 2.44387C0.0329596 2.15917 0.234347 1.53936 0.718709 1.53936H1.48664C1.70325 1.53936 1.89523 1.39988 1.96217 1.19387L2.19947 0.463526Z" fill="white"/>
                    </svg>
                  )                    
                })}
              </div>
              {windowWidth >= 600 && <button>Voir tous les avis</button> }
            </div>
            <div className="actions">
              <div className="like" onClick={(e) => {e.preventDefault(); like(product.id)}}>
                <svg className={`${likeIds.includes(product.id) ? 'liked' : 'notLiked'}`} width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.91428 0C3.64349 0 2.36709 0.520829 1.41986 1.56656C-0.47461 3.65797 -0.471964 6.97426 1.41986 9.06685L8.32224 16.7001C8.40853 16.7948 8.51284 16.8702 8.62872 16.9218C8.74461 16.9734 8.86958 17 8.99591 17C9.12223 17 9.24721 16.9734 9.36309 16.9218C9.47898 16.8702 9.58329 16.7948 9.66958 16.7001C11.9712 14.1591 14.2775 11.6153 16.5792 9.07423C18.4736 6.98284 18.4736 3.66543 16.5792 1.57395C14.6847 -0.517538 11.492 -0.517576 9.59753 1.57395L8.99951 2.23161L8.4015 1.56656C7.45426 0.520834 6.18508 0 4.91428 0V0ZM4.91428 1.83997C5.6774 1.83997 6.43569 2.1775 7.04696 2.85233L8.32945 4.26371C8.41573 4.35834 8.52005 4.43377 8.63593 4.48535C8.75181 4.53693 8.87679 4.56355 9.00311 4.56355C9.12944 4.56355 9.25442 4.53693 9.3703 4.48535C9.48618 4.43377 9.5905 4.35834 9.67678 4.26371L10.9521 2.86711C12.1746 1.5174 14.0021 1.51744 15.2246 2.86711C16.4471 4.21678 16.4471 6.4389 15.2246 7.78846C13.1463 10.083 11.0706 12.3736 8.99231 14.6681L2.7744 7.78109C1.55228 6.42927 1.55191 4.20189 2.7744 2.85233C3.38566 2.1775 4.15117 1.83997 4.91428 1.83997V1.83997Z" fill="white"/>
                  <path d="M1.57178 3.32034C3.97178 -0.679657 7.23845 2.32034 8.57178 4.32034C12.5718 1.82031 12.0718 -1.17969 16.0718 3.32028C19.2718 6.92026 11.9051 13.1537 8.07178 15.3204C4.90512 12.987 -0.828218 7.32034 1.57178 3.32034Z" fill="white"/>
                </svg>
                <img src="/likeBackground.png" alt="Search" className='backgroundLike'/>
              </div>
              <div className="share">
                <img src="/Share.png" alt="Search" className='backgroundLike'/>
              </div>
            </div>
          </div>
        </div>

        <div className="rightContent">
          <div className="prices">
            <div className="mainContent">
              <div className="pricing">
                <h2><span>{new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format(price)}</span> TTC {time}</h2>
                <DateRangePicker
                  hideKeyboardShortcutsPanel
                  navPrev={<img src="/chevronLeftS.svg" alt="" style={{left: "10px"}} />}
                  navNext={<img src="/chevronRightS.svg" alt="" style={{right: "10px"}}/>}
                  firstDayOfWeek={1}
                  noBorder
                  customInputIcon={<img src="/calendar.svg" alt=""/>}
                  customArrowIcon={<img src="/lineSpace.svg" alt=""/>}
                  startDatePlaceholderText={'Du'}
                  endDatePlaceholderText={'au'}
                  startDate={typeof startDate === null || typeof startDate === 'object' ? startDate : null} // momentPropTypes.momentObj or null,
                  startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                  endDate={typeof endDate === null || typeof endDate === 'object' ? endDate : null} // momentPropTypes.momentObj or null,
                  endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                  onDatesChange={({ startDate, endDate }) => {setStartDate(startDate); setEndDate(endDate);}} // PropTypes.func.isRequired,
                  focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                  onFocusChange={focusedInput => setFocusedInput(focusedInput)} // PropTypes.func.isRequired,
                  isDayBlocked={(date) => isBlocked(date)}
                  minimumNights={3}
                  numberOfMonths={windowWidth > 700 ? 2 : 1}
                />
                <a onClick={() => {goToPaiement()}}>
                  <button
                    className={`buttonRed button btnRent ${product.user && product.user.username === me.username ? 'disable' : ''}`}
                  >
                    Louer la série
                  </button>
                </a>
                {error ? (<p className="error">{error}</p>) : (<p className='btnInfo'>{product.user && product.user.username === me.username ? 'Voyons... ceci est votre collection' : 'Vous ne serez pas encore débité'}</p>)}
              </div>
              <div className="delivery">
                {(product.delivery === 'Indifférent' || product.delivery === 'Remise en main propre' || !product.delivery) && (
                  <div className="deliveryElement">
                    <p>Remise en main propre</p>
                    <p>0,00 €</p>
                  </div>
                )}
                {(product.delivery === 'Indifférent' || product.delivery === 'Envoi postal' || !product.delivery) && (

                  <div className="deliveryElement">
                    <p>Relais colis</p>
                    <p>3,31 €</p>
                  </div>
                )}
              </div>
            </div>
            <div className="otherPrice">
              <div className="priceContainer">
                <h3>{new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format((product.tomeFinal - product.tomeInitial + 1) * 7)}</h3>
                <p>Neuf</p>
                <div className="conclusion">= {new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format((product.tomeFinal - product.tomeInitial + 1) * 7 - price)} d'économisés</div>
              </div>
              <div className="priceContainer">
                <h3>≈ {new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format((product.tomeFinal - product.tomeInitial + 1) * 3)}</h3>
                <p>En occasion</p>
                <div className="conclusion">= {new Intl.NumberFormat('fr-FR',{ style: 'currency', currency: 'EUR' }).format((product.tomeFinal - product.tomeInitial + 1) * 3 - price)} d'économisés</div>
              </div>
            </div>
          </div>
          {product.user && (
            <div className="collectorInfo">
              <div className="collector">
                <div className="profilPic">
                <Link href={`/users/${product.user.id}`}>{product.user.profilPic ? <img src={getStrapiMedia(product.user.profilPic.url)} alt="profilPic"/> : <div className="emptyProfilPic">{product.user.username?.charAt(0)}</div>}</Link>
                </div>
                <div className="moreInfo">
                <p><span>{product.user.username}</span> | {product.user.ville} ({product.user.departement})</p>
                  <div className="stars">
                    {
                    [1,2,3,4,5].map((el, index) => {
                      return (
                        <svg width="6" height="5" viewBox="0 0 6 5" fill="none" xmlns="http://www.w3.org/2000/svg" key={index} className={index < product.user.note ? 'starFill' : 'starEmpty'}>
                          <path d="M2.19947 0.463526C2.34915 0.0028702 3.00085 0.0028702 3.15053 0.463526L3.38783 1.19387C3.45477 1.39988 3.64675 1.53936 3.86336 1.53936H4.63129C5.11565 1.53936 5.31704 2.15917 4.92518 2.44387L4.30391 2.89525C4.12867 3.02257 4.05534 3.24825 4.12228 3.45427L4.35958 4.18461C4.50926 4.64527 3.98202 5.02833 3.59016 4.74363L2.96889 4.29225C2.79365 4.16493 2.55635 4.16493 2.38111 4.29225L1.75984 4.74363C1.36798 5.02833 0.840741 4.64527 0.990417 4.18461L1.22772 3.45427C1.29466 3.24825 1.22133 3.02257 1.04609 2.89525L0.424816 2.44387C0.0329596 2.15917 0.234347 1.53936 0.718709 1.53936H1.48664C1.70325 1.53936 1.89523 1.39988 1.96217 1.19387L2.19947 0.463526Z" fill="white"/>
                        </svg>
                      )                    
                    })}
                  </div>
                </div>
              </div>
              {windowWidth >= 600 && <button className={'button buttonWhite'}>Envoyer un message</button>}
              {windowWidth < 600 && <img className='imgMessage' src='/bigArrow.svg' alt='arrow'/>}
            </div>
          )}
        </div>
      </div>

      <div className="descriptionContent">
        <div className="descriptionContainer">
          <p className='title'>Description</p>
          <div className="description">
            {product.description}
          </div>
        </div>    
        {windowWidth >= 600 && <img className='adImg' src="/pub.jpg" alt="pub"/> }
      </div>
      
      {product.title && product.categories && (
        <div className="moreContent">
          {product.title.length > 1 && 
            <div className="sameManga">
              <h2>Les autres collections {product.title}</h2>
              <ProductsList products={productsTitle} maxLength={5} notWantedProductId={product.id} />
            </div>
          }
          <div className="sameManga">
            <h2>Les lecteurs de {product.title} aiment aussi</h2>
            <ProductsList products={productsCategory} maxLength={5} notWantedProductId={product.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;

export async function getStaticProps({ params }) {
  const product = await getProduct(params.slug);
  const productsCategory = await getProductsByCategory(product.categories);
  const productsTitle = await getProductsByTitle(product.title);
  if (!product) return {  redirect: {
    destination: '/404',
    permanent: false
  }}
  return { props: { productSlug : params.slug, productsCategory, productsTitle } };
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
