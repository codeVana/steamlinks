Websites = new Mongo.Collection("websites");

if (Meteor.isClient) {

	Accounts.ui.config({
	    passwordSignupFields: "USERNAME_ONLY"
	  });


	Router.configure({
  layoutTemplate: 'ApplicationLayout'
	});

	Router.route('/', function () {
  	this.render('welcome', {
    	to:"main"
  	});
	});

	Router.route('/website', function () {
  	this.render('navbar', {
    	to:"navbar"
  	});
  	this.render('website', {
    	to:"main"
  	});
	});

	Router.route('/website_item/:_id', function () {
	  this.render('navbar', {
	    to:"navbar"
	  });
	  this.render('website_item_details', {
	    to:"main",
	    data:function(){
	      return Websites.findOne({_id:this.params._id});
	    }
	  });
	});


	/////
	// template helpers
	/////
	// helper function that returns all available websites
	Template.website_list.helpers({
		websites:function(){
			return Websites.find({}, {sort: {upscore: -1}});
		}
	});

  Template.website_item.helpers({
		momentdate: function() {
			var website_id = this._id;
	    var website = Websites.findOne({_id:website_id});
			console.log(moment(website.createdOn).format());
			return moment(website.createdOn).format("dddd, MMMM Do YYYY, h:mm:ss a");
		}
	})
	/////
	// template events
	/////

	Template.website_item.events({
		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			Meteor.call("addUpVote", website_id);
			return false;// prevent the button from reloading the page
		},
		"click .js-downvote":function(event){

			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			Meteor.call("addDownVote", website_id);
			return false;// prevent the button from reloading the page
		}
	})

	Template.website_form.events({
		"click .js-toggle-website-form":function(event){
			$("#website_form").toggle('slow');
		},
		"submit .js-save-website-form":function(event){
			// Prevent default browser form submit
			event.preventDefault();

			// here is an example of how to get the url out of the form:
			var url = event.target.url.value;
			var title = event.target.title.value;
			var description = event.target.description.value;

			//  put your website saving code in here!
      Meteor.call("addWebSite", title, url, description);

		event.target.title.value = "";
 	 	event.target.url.value = "";
		event.target.description.value = "";
			return false;// stop the form submit from reloading the page

		}
	});
	Meteor.subscribe("websites");

}


if (Meteor.isServer) {
	Meteor.methods({
		addWebSite: function(title, url, description) {
			if (! Meteor.userId()) {
	 		throw new Meteor.Error("not-authorized");
 			}
			Websites.insert({
			title:title,
			url:url,
			description:description,
			owner: Meteor.userId(),
      username: Meteor.user().username,
			downscore: 0,upscore: 0,
			createdOn:new Date()
		  });
		},
		addUpVote: function(website_id) {
			Websites.update(website_id, {$inc: {upscore: 1}});
		},
		addDownVote: function(website_id) {
			Websites.update(website_id, {$inc: {downscore: 1}});
		}
	});
	 Meteor.publish("websites", function() {
	    return Websites.find();
	 });

	// start up function that creates entries in the Websites databases.
  Meteor.startup(function () {
    // code to run on server at startup
    if (!Websites.findOne()){
    	console.log("No websites yet. Creating starter data.");
    	  Websites.insert({
    		title:"Chick Tech",
    		url:"http://www.chicktech.org",
    		description:"ChickTech is dedicated to retaining women in the technology workforce and increasing the number of women and girls pursuing technology-based careers",
				downscore: 0,upscore: 0,
    		createdOn:new Date()
    	});
    	 Websites.insert({
    		title:"Girls Make Games",
    		url:"http://girlsmakegames.com",
    		description:"Girls Make Games is a series of international summer camps, workshops and game jams designed to inspire the next generation of designers, creators, and engineers.",
				downscore: 0, upscore: 0,
    		createdOn:new Date()
    	});
    	 Websites.insert({
    		title:"Girl Start",
    		url:"http://www.girlstart.org",
    		description:"Girlstart's mission is to increase girls’ interest and engagement in STEM through innovative, nationally-recognized informal STEM education programs.",
				upscore: 0,
				downscore: 0,
    		createdOn:new Date()
    	});
    }
  });
}
