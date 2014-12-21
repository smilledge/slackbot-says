(function($, Backbone, _, OptionsModel, undefined) {

    var PopupView = Backbone.View.extend({
        el: $('#popup'),

        favoriteChannelTemplate: _.template($('#favoriteChannelsTemplate').html()),

        events: {
            'click .show-options': 'handleShowOptions',
            'submit #post-form': 'handlePostFormSubmit',
            'click .select-channel': 'handleSelectChannel',
            'focus .input-channel': 'handleChannelFocus'
        },

        initialize: function() {
            _.bindAll(this, 'handleChannelFocus', 'renderChannels', 'handlePostFormSubmit');

            this.options = new OptionsModel();
            this.channels = this.options.channels;

            this.renderChannels();
        },

        post: function(data) {
            this.isSubmitting = false;

            if (!this.options.get('slackbotUrl')) {
                chrome.tabs.create({
                    url: chrome.extension.getURL('options.html')
                });
                return;
            }

            $.ajax({
                url: this.options.get('slackbotUrl') + '&channel=' + encodeURIComponent('#' + data.channel),
                type: 'POST',
                data: data.message,
                dataType: 'text'
            })
            .done(function() {})
            .fail(function(jqXHR, textStatus) {
                console.log('Unable to post message to slack: ' + textStatus);
            });
        },

        renderChannels: function() {
            this.$('.favorite-channels').html(this.favoriteChannelTemplate({
                channels: this.channels
            }));
        },

        setChannelName: function(channelName) {
            this.$('[name="channel"]').val(channelName);
            this.hideChannels();
        },

        showChannels: function() {
            this.$('.favorite-channels').show();
        },

        hideChannels: function() {
            this.$('.favorite-channels').hide();
        },

        handleShowOptions: function(e) {
            e.preventDefault();
            e.stopPropagation();
            chrome.tabs.create({
                url: chrome.extension.getURL('options.html')
            });
        },

        handlePostFormSubmit: function(e) {
            e.preventDefault();
            if (this.isSubmitting) {
                return false;
            }
            this.isSubmitting = true;
            this.post({
                channel: this.$('[name="channel"]').val(),
                message: this.$('[name="message"]').val()
            });

            this.$('[name="message"]').val('');
        },

        handleSelectChannel: function(e) {
            e.preventDefault();
            var channel = $(e.target).data('channel-name');
            this.setChannelName(channel);
        },

        handleChannelFocus: function() {
            this.showChannels();
        }
    });

    new PopupView();

}(jQuery, Backbone, _, window.ss.OptionsModel));
