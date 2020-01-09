	
(function($) {
	
	// Model
	function TravelBlog(key, place, country, review, points) 
	{
		var self = this;
		
		self._id     = key;
		self.place   = place;
		self.country = ko.observable(country);
		self.review  = review;
		self.points  = ko.observable(points);

	    self.region = ko.computed(function() {

	        var region = self.country().region;

	        return region;        
	    });
	}

	function Country(key, name, region) 
	{
		var self = this;
		
		self.country_id  = key;
		self.name        = name;
		self.region      = region;
	}

	// ViewModel
	function TravelBlogViewModel() 
	{
		var self     = this;
		self.blogs   = ko.observableArray();
		var blogsRef = firebase.database().ref("Blogs");

	    // Non-editable data
	    self.countries = [
	        new Country(1, 'Afghanistan', 'Central Asia'),
	        new Country(2, 'Iraq', 'Mesopotamia'),
	        new Country(3, 'Syria', 'The Levant'),
	    ];    

	    /*
		blogsRef.once('value', function(snapshot) {

			snapshot.forEach(function(childSnapshot) {

				// console.dir(childSnapshot.key);
				// console.dir(childSnapshot.val());
			});
		});
		*/

		blogsRef.on("child_added", function(snapshot) {

			var travelBlog = new TravelBlog(
					snapshot.key, 
					snapshot.val().place, 
					self.countries[snapshot.val().country_id - 1], 
					snapshot.val().review, 
					snapshot.val().points
				);

			self.blogs.push(travelBlog);
		});

		self.createBlog = function(blog) 
		{
			var travelBlog = new TravelBlog("", "", self.countries[0], "", 1);
			self.blogs.push(travelBlog);
		}
		
		self.saveBlog = function(blog) 
		{
			var travelBlog = {
				place: blog.place, 
				country_id: blog.country().country_id, 
				review: blog.review,
				points: blog.points()
			};

			if (blog._id)
			{
				blogsRef.child(blog._id).update(travelBlog);
			}
			else
			{
				blogsRef.push(travelBlog);
				self.blogs.remove(blog);
			}
		}
		
		self.deleteBlog = function(blog) 
		{ 
			blogsRef.child(blog._id).remove();
			self.blogs.remove(blog);
		}

	    self.totalEntries = ko.computed(function() {

	    	return self.blogs().length;
	    });

	    self.averageRating = ko.computed(function() {
	       
			var totalEntries = self.blogs().length;
			var totalratings = 0;

			for (var i = 0; i < self.blogs().length; i++)
			{
			   totalratings += self.blogs()[i].points();
			}

	    	return (totalratings / totalEntries);
	    });

		ko.bindingHandlers.starRating = 
		{
			init: function(element, valueAccessor) 
			{ // valueAccessor here refers to points
				$(element).addClass("starRating");

				for (var i = 0; i < 5; i++)
				{
				   $("<span>").appendTo(element);
				}
				   
				// Handle mouse events on the stars
				$("span", element).each(function(index) {
					$(this).hover(
						function() 
						{ 
							$(this).prevAll().add(this).addClass("hoverChosen") 
						}, 
						function() 
						{ 
							$(this).prevAll().add(this).removeClass("hoverChosen") 
						}                
					).click(function() { 
					    var observable = valueAccessor();    // Get the associated observable
					    observable(index + 1);               // Write the new rating to it
					}); 
				});
			},
			update: function(element, valueAccessor) 
			{
				// Give the first x stars the "chosen" class, where x <= rating
				var observable = valueAccessor();

				$("span", element).each(function(index) {
					$(this).toggleClass("chosen", index < observable());
				});
			}
		};
	}

    $(document).ready(function() {

		var travelBlogViewModel = new TravelBlogViewModel();
		ko.applyBindings(travelBlogViewModel);
    });

})(jQuery);
