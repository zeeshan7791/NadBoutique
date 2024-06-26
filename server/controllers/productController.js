const Product = require("../Models/productModel");
const ApiFeatures = require("../utils/apiFeatures");
const errorHandler = require("../utils/error");

// admin create Product
const createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    let pics = [];
    req.files.map((item) => {
      pics.push(item.filename);
    });
    req.body.pictures = pics;

    const count = await Product.countDocuments();
    let productId = count + 1;
    req.body.productId = productId;
    if (req.body.pictures.length === 0) {
      return next(errorHandler(401, "please upload pictures"));
    }

    const productLength = await Product.find({});

    const product = await Product.create(req.body);
    return res.status(200).json({
      success: true,
      message: "product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get All Product

const getAllProducts = async (req, res, next) => {
  try {
    const resultPerPage = 5;
    const productsCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter();

    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    if (!products) {
      return res.status(401).json({
        success: true,
        message: "no products found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "products fetched successfully",
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });
  } catch (error) {
    return next(error);
  }
};

// getAdminProduct
const adminAllProducts = async (req, res, next) => {
  try {
 
  
   
    let products = await Product.find();

  
    if (!products) {
      return res.status(401).json({
        success: true,
        message: "no products found",
      });
    }


    return res.status(200).json({
      success: true,
      message: "products fetched successfully",
      products,
   
    
    });
  } catch (error) {
    return next(error);
  }
};
// getSingleProduct

const getSingleProduct = async (req, res, next) => {
  const singleProduct = await Product.findById(req.params.id);
  if (!singleProduct) {
    return next(errorHandler(404, "product does not found"));
  }
  try {
    return res.status(200).json({
      success: true,
      message: "product found",
      singleProduct,
    });
  } catch (error) {
    return next(error);
  }
};
// admin update product
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(errorHandler("Product not found", 404));
    }
    let pics = [];
    req.files.map((item) => {
      pics.push(item.filename);
    });
    if (product.pictures !== 0) {
      req.body.pictures = pics;
    }

    const updatedproduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, useFindAndModify: false }
    );
    return res.status(200).json({
      success: true,
      message: "product update successfully",
      updatedproduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// admin delete-Product
const deleteProduct = async (req, res, next) => {

  const findProduct = await Product.findById(req.params.id);

  if (!findProduct) {
    return next(errorHandler(404, "product does not found"));
  }
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "product deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//  createProductReview

const createProductReview = async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: parseInt(rating),
    comment,
  };
  const product = await Product.findById(productId);
  if (!product) {
    return next(errorHandler(404, "product not found"));
  }

  try {
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );


    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
    let avg = 0;
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    return res.status(200).json({
      success: true,
      message: isReviewed ? "Feedback updated" : "Feedback added",
    });
  } catch (error) {
    return next(errorHandler);
  }
};
const getAllReviews = async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(errorHandler(404, "product not found"));
  }
  try {
    return res.status(200).json({
      success: true,
      message: "reviews fetched successfully",
      reviews: product.reviews,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    // Find the product by productId
   
    const product = await Product.findById(req.query.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Filter out the review to be deleted
    product.reviews = product.reviews.filter(
      (review) => review._id.toString() !== req.query.id.toString()
    );

    // Calculate average rating and number of reviews
    let totalRating = 0;
    product.reviews.forEach((review) => {
      totalRating += review.rating;
    });
    const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
    const numOfReviews = product.reviews.length;

    // Update product document in the database
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews: product.reviews,
        ratings: averageRating,
        numOfReviews: numOfReviews,
      },
      { new: true }
    );

   return res.status(200).json({ success: true,message:"review deleted successfully" });
  } catch (error) {
    // Handle any errors
    next(error);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  deleteProduct,
  getSingleProduct,
  createProductReview,
  getAllReviews,
  deleteReview,
  adminAllProducts,
};
