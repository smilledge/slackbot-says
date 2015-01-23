(function($, Backbone, _, OptionsModel, undefined) {

    var OptionsPageView = Backbone.View.extend({
        el: $('#options-page'),

        optionsFormTemplate: _.template($('#optionsFormTemplate').html()),
        channelsTemplate: _.template($('#channelsTemplate').html()),

        events: {
            'click .add-channel': 'handleAddChannel',
            'click .remove-channel': 'handleRemoveChannel',
            'change [name="slackbotUrl"]': 'handleWebhookChange'
        },

        initialize: function() {
            ga('send', 'pageview', '/options.html');

            this.options = new OptionsModel();
            this.channels = this.options.channels;

            this.options.on('change', this.renderOptions, this);
            this.channels.on('change add remove', this.renderOptions, this);

            this.options.on('invalid', this.handleValidationError, this);

            this.render();
        },

        render: function() {
            this.renderOptions();
        },

        renderOptions: function() {
            this.$('#options-form').html(this.optionsFormTemplate({
                options: this.options
            }));

            this.$('#channels').html(this.channelsTemplate({
                channels: this.channels
            }));
        },

        handleWebhookChange: function(e) {
            e.preventDefault();
            this.options.set('slackbotUrl', this.$('[name="slackbotUrl"]').val(), { validate: true });
            ga('send', 'event', 'options', 'change', 'slackbot url');
        },

        handleAddChannel: function(e) {
            e.preventDefault();
            var name = this.$('[name="channel"]').val();

            if (!name || !name.length) {
                return;
            }

            this.channels.add({
                name: name
            });

            $('[name="channel"]').val('');

            ga('send', 'event', 'options', 'add', 'channel');
        },

        handleRemoveChannel: function(e) {
            this.channels.remove(this.channels.filter(function(item) {
                return item.get('name') === $(e.target).data('channel-name');
            }));

            ga('send', 'event', 'options', 'remove', 'channel');
        },

        handleValidationError: function(model, error) {
            alert(error);
        }
    });

    new OptionsPageView();

}(jQuery, Backbone, _, window.ss.OptionsModel));
