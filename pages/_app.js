import App from "next/app";
import Head from "next/head";
import 'react-dates/initialize';
import Layout from "../components/Layout";
import { getCategories } from "../utils/api";
import "../styles/index.scss";
import 'swiper/swiper.scss';
// import { withRedux } from '../lib/redux';
import { Provider } from 'react-redux';
import store from '../store';

const MyApp = ({ Component, pageProps }) => {
  return (
    <Provider store={store} >
      <Layout categories={pageProps.categories}>
        <Head>

          <script async src="https://www.googletagmanager.com/gtag/js?id=G-VJXJWC2G20%22%3E"></script>
          <script dangerouslySetInnerHTML={{__html:`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-VJXJWC2G20');`}} ></script>


          <script dangerouslySetInnerHTML={{__html:`(function(h,o,t,j,a,r){
            h.hj=h.hjfunction(){(h.hj.q=h.hj.q[]).push(arguments)};
            h._hjSettings={hjid:2457670,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-%27,%27.js?sv=%27);`}} ></script>
        </Head>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
};

// getInitialProps disables automatic static optimization for pages that don't
// have getStaticProps. So [[...slug]] pages still get SSG.
// Hopefully we can replace this with getStaticProps once this issue is fixed:
// https://github.com/vercel/next.js/discussions/10949
MyApp.getInitialProps = async (ctx) => {
  // Calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(ctx);
  // Fetch global site settings from Strapi
  const categories = await getCategories();
  // Pass the data to our page via props
  return { ...appProps, pageProps: { categories, path: ctx.pathname } };
};

export default MyApp;
