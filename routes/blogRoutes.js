const express = require('express');
const Blog = require ('../models/blog')
const { createBlog, getBlogs,getOwnerBlogs, getBlogById, updateBlog, deleteBlog } = require('../controllers/blogController');
const authMiddleware = require('../middlewares/authMiddleware');
const {blogValidatorMiddleware} = require('../validator/blogValidator');
const router = express.Router();

router.get('/create', authMiddleware, (req, res) => {
    res.render('createBlog');
});


router.get('/authors/:authorId', authMiddleware, async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.params.authorId }); // Fetch blogs by author ID
        res.render('blog', { blogs });
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal Server Error');
    } 
});  
 
 

 
router.post('/',authMiddleware,blogValidatorMiddleware, createBlog); 
router.get('/', getBlogs);
router.get('/authors', authMiddleware, getOwnerBlogs);
router.get('/:id', getBlogById);
router.put('/:id', authMiddleware,blogValidatorMiddleware, updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);

module.exports = router;