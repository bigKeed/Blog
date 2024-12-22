const Blog = require('../models/blog');
const User = require('../models/user')
const mongoose = require('mongoose');


function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
};

exports.createBlog = async (req, res) => {
  
    const { title, description, tags, body } = req.body;
    const author = req.user._id;

    // Validate input
    if (!title || !description || !author || !body) {
        return res.status(400).json({ error: 'Title, description, author, and body are required' });
    }

    // Calculate reading time (assuming an average reading speed of 200 words per minute)
    const readingTime = Math.ceil(body.split(' ').length / 200);

    const newBlog = new Blog({
        title,
        description,
        tags: tags || [], // Default to an empty array if no tags are provided
        author,
        reading_time: readingTime,
        body,
    });


   
    try {
       
        const savedBlog = await newBlog.save();
        res.redirect('/api/blogs/');
    } catch (error) {
        
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getBlogs = async (req, res) => {
    try {
        // Get query parameters with default values
        const { page = 1, limit = 20, search, sort = 'timestamp' } = req.query;

        // Convert page and limit to numbers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Validate page and limit
        if (pageNumber < 1 || limitNumber < 1) {
            return res.status(400).json({ message: 'Page and limit must be greater than 0' });
        }

        // Build the query object
        const query = {};

        // If search term is provided, handle it
        if (search) {
            const regex = new RegExp(search, 'i');

            // First, find authors matching the search term
            const authors = await User.find({
                $or: [
                    { first_name: { $regex: regex } },
                    { last_name: { $regex: regex } },
                    { email: { $regex: regex } }
                ]
            }).select('_id');

            // If authors are found, add them to the query
            if (authors.length > 0) {
                query.$or = [
                    { title: { $regex: regex } },
                    { tags: { $regex: regex } },
                    { author: { $in: authors.map(author => author._id) } } // Use author IDs
                ];
            } else {
                // If no authors found, just search by title and tags
                query.$or = [
                    { title: { $regex: regex } },
                    { tags: { $regex: regex } }
                ];
            }
        }

        // Determine sorting criteria
        const sortOptions = {};
        if (['read_count', 'reading_time', 'timestamp'].includes(sort)) {
            sortOptions[sort] = -1; 
        } else {
            sortOptions['timestamp'] = -1; // Default sort by timestamp descending
        }

        // Fetch blogs with pagination, search, and sorting
        const blogs = await Blog.find(query)
            .populate('author', 'first_name last_name email')
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort(sortOptions); 

             // Check if any blogs were found
        if (blogs.length === 0) {
            return res.status(404).json({ message: 'No blogs found matching the search criteria' });
        }; 

        // Get total count of documents matching the query
        const total = await Blog.countDocuments(query);

        res.render('blogs', {  total,
            page: pageNumber,
            limit: limitNumber,
            blogs, }); //here
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getOwnerBlogs = async (req, res) => {
    try {
        const userId = req.user._id; 
        const { page = 1, limit = 20, state } = req.query;

        // Convert page and limit to numbers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Validate page and limit
        if (pageNumber < 1 || limitNumber < 1) {
            return res.status(400).json({ message: 'Page and limit must be greater than 0' });
        }

        // Build the query object
        const query = { author: userId }; 

        // If state is provided, add it to the query
        if (state) {
            query.state = state;
        }

        // Fetch blogs with pagination and filtering
        const blogs = await Blog.find(query)
            .populate('author', 'first_name last_name email') 
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber) 
            .sort({ timestamp: -1 }); 

        // Check if any blogs were found
        if (blogs.length === 0) {
            return res.status(404).json({ message: 'No blogs found for this user' });
        }

        // Get total count of documents matching the query
        const total = await Blog.countDocuments(query);

        res.render('blog', {blogs})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getBlogById = async (req, res) => {
    const { id } = req.params;

    console.log('Fetching blog with ID:', id);
    
     // Validate's the ID format
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    };

   try {
        const blog = await Blog.findById(id).populate('author', 'first_name last_name email');
    if (!blog) {
        return res.status(404).json({ message: 'Blog not found' })};
        blog.read_count += 1;
        await blog.save();
    res.json(blog);
        
    res.render('blog', { blog, user: req.user }); 
   } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal Server Error' });
}}; 

exports.updateBlog = async (req, res) => {

    //parse id in route
   try {
    const { id } = req.params;
    const { title, description, tags, body, state } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.tags = tags || blog.tags;
    blog.body = body || blog.body;
    blog.state = state || blog.state;
    await blog.save();
    res.redirect('/api/blogs/') 
   } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' });
   }
};

exports.deleteBlog = async (req, res) => {
   
    const { id } = req.params;

    console.log('Fetching blog with ID:', id);

       // Validate the ID format
       if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    };

   try {
    const blog = await Blog.findById(id);
    if (!blog || blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    
    await Blog.deleteOne({ _id: id });
    res.redirect('/api/blogs/');
   } catch (error) {
    console.error(error)
        res.status(500).json({ message: 'Internal Server Error' });
   }
};