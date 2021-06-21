/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import ProductsList from "../../components/ProductsList";
import { getManga, getMangaCollection, getProductsByTitle } from "../../utils/api";
import { getStrapiMedia } from "../../utils/medias";

// Date
import { DateRangePicker } from 'react-dates';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import 'moment/locale/fr'
import 'react-dates/lib/css/_datepicker.css';


import { useDispatch, useSelector } from "react-redux";
import { paiementData, updateMe } from "../../store";

// Data
import dataCities from '../../utils/dataCities'

const delivery = [
  'Point relais',
  'Remise en main propre',
  'Indifférent'
]

const filters = [
  'Les plus récents',
  'Les plus anciens',
  'Les moins chers',
  'Les plus loués'
]


const MangaPage = ({ manga, products }) => {


  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading products...</div>;
  }

  const listEl = useRef(null);

  const dispatch = useDispatch();
  const { session } = useSelector((state) => state);
  const moment = extendMoment(Moment);

  const [windowWidth, setWindowWidth] = useState(1281);

  const [allProducts, setAllProducts] = useState(products)
  const [productList, setProductList] = useState([]);

  // mangaInfo
  const [synopsisOpen, setSynopsisOpen] = useState(false);
  const [rank, setRank] = useState(0);

  //FilterBar
  const [filterOpen, setFilterOpen] = useState(false);

  const [tomeInitial, setTomeInitial] = useState();
  const [tomeFinal, setTomeFinal] = useState();

  const [selectGeoOpen, setSelectGeoOpen] = useState(false)
  const [inputCity, setInputCity] = useState('');
  const [cityList, setCityList] = useState([]);
  const [rayon, setRayon] = useState(25);

  const [selectDeliveryOpen, setSelectDeliveryOpen] = useState(false);
  const [deliverySelected, setDeliverySelected] = useState(0);

  const [selectFilterOpen, setSelectFilterOpen] = useState(false);
  const [filterSelected, setFilterSelected] = useState(0);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [focusedInput, setFocusedInput] = useState();

  const [changes, setChanges] = useState(false);

  const [tabSelected, setTabSelected] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', updateSize);
  }, []);

  const updateSize = () => {
    setWindowWidth(window.innerWidth)
  }


  useEffect(() => {
    getMangaList()
  }, [session])

  useEffect(() => {
    if(listEl.current && windowWidth > 700) {
      setTimeout(() => {
        if(listEl.current && windowWidth > 700) {
          listEl.current.scrollIntoView({behavior: 'smooth'})
        }
      }, 300);
    }
  }, [listEl.current])

  const getMangaList = () => {
    getMangaCollection(session).then(resp => {
      if (!resp.error) {
        setupTopManga(resp);
      }
    }).catch(()=> console.log('error'))
  }

  const setupTopManga = (data) => {
    const arrayBooked = [];
    data.forEach((manga) => {
      if(manga.products.length > 0) {
        let booked = 0;
        manga.products.forEach((product) => {
          booked += product.booked ? product.booked.length : 0;
        })
        arrayBooked.push({booked: booked, manga: manga.title})
      }
    })
    arrayBooked.sort(function(a, b) {
      return b.booked - a.booked;
    });
    const newMangaCollection = [];
    arrayBooked.forEach((item) => {
      data.forEach((manga, index) => {
        if(item.manga === manga.title) {
          newMangaCollection.push(manga)
        }
      })
    })
    setRank(newMangaCollection.findIndex(val => val.title === manga.title ))
    setTopManga(newMangaCollection)
  }

  useEffect(() => {
    let newProductList = [];
    if(tomeInitial !== undefined && tomeFinal !== undefined && tomeInitial < tomeFinal) {
      allProducts.forEach((_product) => {
        if(_product.tomeInitial === parseInt(tomeInitial) && _product.tomeFinal === parseInt(tomeFinal)) {
          newProductList.push(_product);
        }
        else if(_product.tomeFinal < parseInt(tomeFinal) && _product.tomeInitial > parseInt(tomeInitial)) {
          newProductList.push(_product);
        }
        else if(_product.tomeFinal > parseInt(tomeInitial) && _product.tomeInitial < parseInt(tomeFinal)) {
          newProductList.push(_product);
        }
      })
    }
    else {
      allProducts.forEach((_product) => {
        newProductList.push(_product);
      })
    }
    const newProductListCityFilter = [];
    if(cityList.length > 0) {
      newProductList.forEach((_product) => {
        cityList.forEach((_city) => {
          if(_city.toLowerCase().includes(_product.user.ville.toLowerCase())) {
            newProductListCityFilter.push(_product);
          }
        })
      })
      newProductList = newProductListCityFilter;
    }
    const newProductListDateFilter = [];
    if(startDate && endDate) { 
      newProductList.forEach((_product) => {
        if(_product.booked && moment.range(_product.booked[0].startDate,_product.booked[0].endDate).contains(moment.range(startDate, endDate))) {
          newProductListDateFilter.push(_product);
        }
      })
      newProductList = newProductListDateFilter;
    }
    setProductList(newProductList)
  }, [tomeInitial, tomeFinal, cityList, startDate, endDate]);

  useEffect(() => {
    if(productList.length > 0) {
      const newProductList = productList;
      if(filterSelected === 0) {
        newProductList.sort(function(a, b) {
          return new Date(a.created_at) - new Date(b.created_at);
        })
      }
      else if(filterSelected === 1) {
        newProductList.sort(function(a, b) {
          return new Date(b.created_at) - new Date(a.created_at);
        });
      }
      else if(filterSelected === 2) {
        newProductList.sort(function(a, b) {
          return a.price - b.price;
        });
      }
      
      else if(filterSelected === 3) {
        newProductList.sort(function(a, b) {
          return a.booked.length - b.booked.length;
        });
      }
      setChanges(!changes)
      setProductList(newProductList)
    }
  }, [productList, filterSelected]);

  const removeCity = (index) => {
    const newArray = cityList;
    newArray.splice(index, 1);
    setCityList(newArray);
    setChanges(!changes)
  }
 
  const saveDate = () => {
    if(startDate && endDate) {
      dispatch(paiementData([], startDate, endDate));
    }
  }

  const resetFilters = () => {
    setStartDate();
    setEndDate();
    setTomeInitial();
    setTomeFinal();
    setCityList([]);
  }

  const formatDate = (date) => {
    let d = new Date(date);
    return [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/');
  }
  
  return (
    <div className="mangaPage">
      <Head>
        <title>{manga.title} </title>
      </Head>
      {windowWidth < 700 && 
        <div className="tabulations">
          <div className={tabSelected === 0 ? "tabulation tabSelected" : "tabulation"} onClick={() => setTabSelected(0)}>
            Informations
          </div>
          <div className={tabSelected === 1 ? "tabulation tabSelected" : "tabulation"}  onClick={() => setTabSelected(1)}>
            Annonces
          </div>
        </div>
      
      }
      {(tabSelected === 0 || windowWidth >= 700) &&
      <div className="mangaInfo">
        <img src={manga.cover ? getStrapiMedia(manga.cover.url) : '/cuteCat.svg'} alt="cover" className="cover"/>
        <div className="rightContainer">
          <div className="header">
            <h2>{manga.title}</h2>
            <div className="ranking">
              <h3>n°{rank + 1}</h3>
              <p className="label">Classement top des lecteurs</p>
            </div>
          </div>
          <div className="info">
            <p className="label">Dessinateur</p>
            <p className="answer">{manga.artist}</p>
          </div>
          <div className="info">
            <p className="label">Scénariste</p>
            <p className="answer">{manga.scenarist}</p>
          </div>
          <div className="info">
            <p className="label">Année de création</p>
            <p className="answer">{manga.year}</p>
          </div>
          <div className="info infoCatégories">
            <p className="label">Catégories</p>
            <p className="answer">
              {manga.categories.map((category) => {
                return (
                  `#${category.slug} `
                )
              })}
            </p>
          </div>
          <div className="info">            
            <p className="label">Nombre de tomes</p>
            <div>
              <div className="frenchVolumes">
                <p className="answer">{manga.frenchVolumes} <img src="/frenchFlag.png" alt="frenchFlag"/> ({manga.frenchParutionOver ? 'Terminé' : 'En cours'})</p>
              </div>
              <div className="japVolumes">
                <p className="answer">{manga.japVolumes} <img src="/japFlag.png" alt="japFlag"/> ({manga.japParutionOver ? 'Terminé' : 'En cours'})</p>
              </div>
            </div>
          </div>
          {windowWidth >= 700 && 
          <div className="info infoSynopsis">
            <p className="label">Synopsis</p>
            <p className={synopsisOpen ? "answer answerOpen" : "answer"} dangerouslySetInnerHTML={{__html: manga.synopsis}}></p>
            <p className="seemore" onClick={() => setSynopsisOpen(!synopsisOpen)}>{synopsisOpen ? 'Voir moins...' : 'Voir plus...'}</p>
          </div>
          }
          {windowWidth >= 700 && 
          <div className="links">
            {manga.links.map((link) => {
              return (
                <a href={link.link} className='link'>Lien sens critique</a>
              )
            })}
          </div>
          }
        </div>
        {windowWidth < 700 && 
          <div className="info infoSynopsis">
            <p className="label">Synopsis</p>
            <p className={synopsisOpen ? "answer answerOpen" : "answer"} dangerouslySetInnerHTML={{__html: manga.synopsis}}></p>
            <p className="seemore" onClick={() => setSynopsisOpen(!synopsisOpen)}>{synopsisOpen ? 'Voir moins...' : 'Voir plus...'}</p>
          </div>
          }
          {windowWidth > 700 && 
          <div className="links">
            {manga.links.map((link) => {
              return (
                <a href={link.link} className='link'>Lien sens critique</a>
              )
            })}
          </div>
          }
      </div>
      }
      {(tabSelected === 1 || windowWidth >= 700) && 
      <div className={windowWidth > 700 ? "filterBar" : filterOpen ? 'filterBar filterBarMobile filterBarMobileOpen' : 'filterBar filterBarMobile'} ref={windowWidth > 700 ? listEl : null}>
        <h3>Recherche avancée</h3>
        <div className="filters">
          <div className="filter">
            <p className="label">Tomes</p>
            <div className="inputs">
              <input type="number" min="1" max="200" value={tomeInitial} onChange={(e) => setTomeInitial(e.target.value)} placeholder='1' />
              <p>au</p>
              <input type="number" min="1" max="200" value={tomeFinal} onChange={(e) => setTomeFinal(e.target.value)} placeholder='10' />
            </div>
          </div>
          <div className="filter">
            <p className="label">Zone géographique</p>
            <div className="select selectGeo">
              <input type="text" placeholder='Saisissez une ville' autoComplete="off" value={inputCity} onChange={(e) => setInputCity(e.target.value)} />
              {/* {selectGeoOpen && inputCity.length < 3 && cityList.length > 0 &&
                <div className="options">
                  <div className="cityList">
                    {cityList.map((city, key) => {
                      return <p key={key} className='cityLabel'>{city} <img src="/exitCross.svg" alt="exit" onClick={() => removeCity(key)} /></p>
                    })}
                  </div>
                  <div className="rayon">
                    <p>Rayon</p>
                  </div>
                  <button onClick={() => setSelectGeoOpen(false)}>Valider</button>
                </div>
              } */}
              {inputCity.length > 2 && 
                <div className="autocompletion">
                  {dataCities.map((city, key) => {         
                    if(city.name.toLowerCase().startsWith(inputCity.toLowerCase())) {
                      return (
                        <p className="option" key={key} onClick={() => {setCityList([...cityList, `${city.name} (${city.departement})`]); setInputCity(''); setSelectGeoOpen(true)}}>{city.name} ({city.departement})</p>
                      )
                    }
                  })}
                </div>
              }
            </div>
          </div>
          <div className="filter">
            <p className="label">Mode de livraison</p>
            <div className="select selectDelivery">
              <p>{delivery[deliverySelected]}</p>
              <img src="/chevronLeftS.svg" alt="arrow" className={selectDeliveryOpen ? 'imageOpen' : ''} onClick={() => setSelectDeliveryOpen(!selectDeliveryOpen)} />
              {selectDeliveryOpen && 
                <div className="options">
                  {delivery.map((option, key) => {
                    if(option !== delivery[deliverySelected])
                    return (
                      <p className="option" key={key} onClick={() => {setDeliverySelected(key);setSelectDeliveryOpen(false)}}>{option}</p>
                    )
                  })}
                </div>
              }
            </div>
          </div>
          <div className="filter">
            <p className="label">Trier par</p>
            <div className="select selectFilter">
              <p>{filters[filterSelected]}</p>
              <img src="/chevronLeftS.svg" alt="arrow" className={selectFilterOpen ? 'imageOpen' : ''} onClick={() => setSelectFilterOpen(!selectFilterOpen)}/>
              {selectFilterOpen && 
                <div className="options">
                  {filters.map((option, key) => {
                    if(option !== filters[filterSelected])
                    return (
                      <p className="option" key={key} onClick={() => {setFilterSelected(key);setSelectFilterOpen(false)}}>{option}</p>
                    )
                  })}
                </div>
              }
            </div>
          </div>
          <div className="filter filterDate">            
            <p className="label">Date de location</p>
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
              startDate={startDate} // momentPropTypes.momentObj or null,
              startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
              endDate={endDate} // momentPropTypes.momentObj or null,
              endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
              onDatesChange={({ startDate, endDate }) => {setStartDate(startDate); setEndDate(endDate);}} // PropTypes.func.isRequired,
              focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={focusedInput => setFocusedInput(focusedInput)} // PropTypes.func.isRequired,
              minimumNights={3}
              numberOfMonths={windowWidth > 700 ? 2 : 1}
            />
          </div>
        </div>
        <div className="activeFilters">
          <div className="labels">
            {tomeInitial && tomeFinal && 
              <div className="label">
                Tomes {tomeInitial} à {tomeFinal} <img src="/exitCross.svg" alt="exit" onClick={() => {setTomeInitial(); setTomeFinal()}} />
              </div>
            }
            {cityList.map((city, key) => {
              return (
                <div className="label" key={key}>
                  {city} <img src="/exitCross.svg" alt="exit" onClick={() => removeCity(key)} />
                </div>
              )
            })               
            }
            {startDate && endDate && 
              <div className="label">
                {formatDate(startDate)} - {formatDate(endDate)} <img src="/exitCross.svg" alt="exit" onClick={() => {setTomeInitial(); setTomeFinal()}} />
              </div>
            }
          </div>
            <button className="resetFilters" onClick={() => resetFilters()}>
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.4791 2.68672V13.6742C12.4791 14.9574 11.5042 16 10.2563 16H3.70474C2.49582 16 1.48189 14.9574 1.48189 13.6742V2.68672H0.389972C0.155989 2.68672 0 2.52632 0 2.28571C0 2.08521 0.155989 1.88471 0.389972 1.88471H3.66574V0.401003C3.66574 0.160401 3.82173 0 4.05571 0H9.94429C10.1783 0 10.3343 0.200501 10.3343 0.401003V1.88471H13.61C13.805 1.88471 14 2.04511 14 2.28571C14 2.48622 13.805 2.68672 13.61 2.68672H12.4791ZM2.26184 2.68672V13.6742C2.26184 14.5163 2.92479 15.198 3.70474 15.198H10.2563C11.0752 15.198 11.6992 14.5163 11.6992 13.6742V2.68672H2.26184ZM9.55432 1.88471V0.802005H4.44568V1.88471H9.55432Z" fill="#F5F6F7"/>
                <path d="M4.32861 5.4137C4.32861 5.2132 4.4846 5.0127 4.71859 5.0127C4.91357 5.0127 5.10856 5.2132 5.10856 5.4137V12.4713C5.10856 12.6718 4.91357 12.8723 4.71859 12.8723C4.4846 12.8723 4.32861 12.6718 4.32861 12.4713V5.4137Z" fill="#F5F6F7"/>
                <path d="M8.89136 5.4137C8.89136 5.2132 9.04735 5.0127 9.28133 5.0127C9.47632 5.0127 9.6713 5.2132 9.6713 5.4137V12.4713C9.6713 12.6718 9.47632 12.8723 9.28133 12.8723C9.04735 12.8723 8.89136 12.6718 8.89136 12.4713V5.4137Z" fill="#F5F6F7"/>
                <path d="M6.59058 5.4137C6.59058 5.2132 6.78556 5.0127 6.98055 5.0127C7.21453 5.0127 7.37052 5.2132 7.37052 5.4137V12.4713C7.37052 12.6718 7.21453 12.8723 6.98055 12.8723C6.78556 12.8723 6.59058 12.6718 6.59058 12.4713V5.4137Z" fill="#F5F6F7"/>
              </svg>
              Supprimer les filtres
            </button>
        </div>
      </div>
      }
      {(tabSelected === 1 || windowWidth >= 700) && 
        <div className="result">
          <ProductsList products={productList} saveDate={saveDate}/>
        </div>
      }
      {(tabSelected === 1 && windowWidth < 700) && 
        <div className="footer">
          <button className="btnOpenFilter" onClick={() => setFilterOpen(!filterOpen)}>
            {filterOpen ? 'Appliquer' : 'Recherche avancée'}
          </button>
        </div>
      }
    </div>
  );
};

export default MangaPage;

export async function getStaticProps({ params }) {
  const manga = await getManga(params.id);  
  const products = await getProductsByTitle(manga.title);
  if (!products || !manga) return {  redirect: {
    destination: '/404',
    permanent: false
  }}
  return { props: { manga, products } };
}

export async function getStaticPaths() {
  const mangas = await getMangaCollection();
  return {
    paths: mangas.map((_manga) => {
      return {
        params: { id: _manga.id.toString() },
      };
    }),
    fallback: false,
  };
}

