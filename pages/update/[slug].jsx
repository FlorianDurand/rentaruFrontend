/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import Step2 from "../../components/createProductStep/Step2"
import Step3 from "../../components/createProductStep/Step3"
import Step4 from "../../components/createProductStep/Step4"
import Step5 from "../../components/createProductStep/Step5"
import PreviewProduct from "../../components/createProductStep/PreviewProduct"
import { getProducts, getProduct } from "../../utils/api";
import { putProduct } from '../../store'
import Link from "next/link";
import Button from "../../elements/Button";

const ProductPage = ({ product }) => {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const dispatch = useDispatch();
  
  const state = useSelector((state) => state);
  const { session, user, errorState, createdProduct } = state;
  
  const [step, setStep] = useState(2)
  const [data, setData] = useState({
    tomeInitial: product.tomeInitial,
    tomeFinal: product.tomeFinal,
    etat: product.etat,
    edition: product.edition,
    langue: product.langue,
    integrale: product.integrale,
    images: product.images,
    price: product.price,
    description: product.description,
    delivery: product.delivery
  })
  const [preview, setPreview] = useState({
    title: product.title,
    imageCover: product.imageCover
  })

  useEffect(() => {
    if (step < 2) {
      setStep(2)
    }
  }, [step])

  useEffect(() => {
    if(step === 6) {
      const formData = new FormData()
      
      if (data.images?.length > 0) {
        data.images.forEach((file) => {
          if (!file.id) {
            formData.append('ref', 'products')
            formData.append('refId', product.id)
            formData.append('field', 'images')
            formData.append(`files.images`, file)
          }
        })
        data.images = data.images.filter(image => image.id).map(image => image.id)
      }
      formData.append('data', JSON.stringify(data))
      dispatch(putProduct(product.id, formData, session))
    }
  }, [step])

  if (user.username !== product.user.username) {
    return <div>Ceci n'est pas votre produit, j'appelle la police</div>;
  }

  return (
    <div className="createProductContainer">
      
      <Head>
        <title>Modifier votre annonce : {product.title}</title>
      </Head>
      <div className="topContainer">
        <div className="stepCount">{step-1}/5</div>
        <h2>Modification d'une annonce</h2>
      </div>

      <div className="middleContainer">
        <div className="step">
          
          {(() => {
      
            switch (step) {
              case 2:
                return (
                  <Step2 step={step} setStep={setStep} user={user} data={data} setData={setData} preview={preview} setPreview={setPreview} />
                )
              case 3:
                return (
                  <Step3 step={step} setStep={setStep} user={user} data={data} setData={setData} preview={preview} setPreview={setPreview} />
                )
              case 4:
                return (
                  <Step4 step={step} setStep={setStep} user={user} data={data} setData={setData} preview={preview} setPreview={setPreview} />
                )
              case 5:
                return (
                  <Step5 step={step} setStep={setStep} user={user} data={data} setData={setData} preview={preview} setPreview={setPreview} />
                )
              case 6:
                return errorState.type === "createProduct" ? (
                  <div>{errorState.message}</div>
                ) : (<div className="finalStep">
                    Annonce modifiée, Merci... 
                    {createdProduct.slug && (
                      <div className="btnContainer">
                        <Link href={`/products/${createdProduct.slug}`} >
                          <a>
                            <Button color="White">Voir mon annonce</Button>
                          </a>
                        </Link>
                    </div>
                    )}
                  </div>)
              default:
                return (
                  <Step2 step={step} setStep={setStep} user={user} data={data} setData={setData} preview={preview} setPreview={setPreview} />
                )
            }

          })()}
        </div>
        <div className="preview">
          {preview && (
            <PreviewProduct data={preview} user={user}/>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

export async function getStaticProps({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return {  redirect: {
    destination: '/404',
    permanent: false
  }}
  return { props: { product } };
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
