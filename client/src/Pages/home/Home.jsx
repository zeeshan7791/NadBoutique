import "./Home.css";
// import {CgMouse} from "react-icons/all"
import { CgMouse } from "react-icons/cg";
import ProductCard from "../../components/products/ProductCard";

// import axios from "axios";
import MetaData from "../../components/layout/MetaData";

import Loader from "../../components/layout/loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { allProductsActions } from "../../redux/products/allProductsSlice";
import { useEffect } from "react";
import { serverURL } from "../../config/config";

const Home = () => {
  const { allProducts, loading } = useSelector(
    (state) => state.allProducts
  );

  const dispatch = useDispatch();
  const showAllProducts = async () => {
    try {
      dispatch(allProductsActions.ALL_PRODUCT_REQUEST());
      const res = await fetch(`${serverURL}/product/all-products`);

      const data = await res.json();

      if (data.success === false) {
        dispatch(allProductsActions.ALL_PRODUCT_FAIL(data.message));
        return;
      }
      dispatch(allProductsActions.ALL_PRODUCT_SUCCESS(data));
      return;
    } catch (error) {
      dispatch(allProductsActions.ALL_PRODUCT_FAIL(error.message));
    }
  };

  useEffect(() => {
    showAllProducts();
  }, [dispatch]);
 
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <MetaData title={"Nadboutique --Ecommerce"} />
          <div className="banner">
            <p>Welcome to Ecommerce</p>
            <h1>FIND AMAZING PRODUCTS BELOW</h1>
            <a href="#container">
              <button>
                Scroll <CgMouse />
              </button>
            </a>
          </div>
          <h2 className="homeHeading">Featured Products</h2>
          <div className="container" id="container">
            {allProducts===null
              ? <>
              <div><p>no Product Exist</p></div>
              </>              : allProducts.products &&
                allProducts.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>
        </>
      )}
    </>
  );
};

export default Home;
