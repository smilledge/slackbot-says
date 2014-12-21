(function($, Backbone, _, undefined) {

    var ChannelModel = Backbone.Model.extend({});    
    var ChannelCollection = Backbone.Collection.extend({
        model: ChannelModel
    });

    var OptionsModel = Backbone.Model.extend({

        webhookRegex: /https\:\/\/.+\.slack\.com\/services\/hooks\/slackbot\?token\=.+/,

        initialize: function() {
            this.channels = new ChannelCollection([]);

            this.fetch();

            this.channels.on('all', this.save, this);
            this.on('all', this.save, this);
        },

        fetch: function() {
            this.set(JSON.parse(localStorage.getItem('options')));
            this.channels.reset(this.get('channels'));
        },

        save: function(attributes) {
            var data = this.toJSON();
            data.channels = this.channels.toJSON();
            localStorage.setItem('options', JSON.stringify(data));
        },

        destroy: function(options) {
            localStorage.removeItem('options');
        },

        isEmpty: function() {
            return (_.size(this.attributes) <= 1);
        },

        validate: function(attrs, options) {
            if (!this.webhookRegex.test(attrs.slackbotUrl)) {
                return "Invalid Slackbot URL";
            }
        }
    });

    window.ss = window.ss || {};
    window.ss.OptionsModel = OptionsModel;

}(jQuery, Backbone, _));
