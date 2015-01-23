(function($, Backbone, _, OptionsModel, undefined) {

    var PopupView = Backbone.View.extend({
        el: $('#popup'),

        favoriteChannelTemplate: _.template($('#favoriteChannelsTemplate').html()),

        events: {
            'click .show-options': 'handleShowOptions',
            'submit #post-form': 'handlePostFormSubmit',
            'click .select-channel': 'handleSelectChannel',
            'focus .input-channel': 'handleChannelFocus',
            'blur .input-channel': 'handleChannelBlur'
        },

        initialize: function() {
            ga('send', 'pageview', '/popup.html');

            _.bindAll(this, 'handleChannelFocus', 'handleChannelBlur', 'renderChannels', 'handlePostFormSubmit', 'saveDefaultChannel');

            this.options = new OptionsModel();
            this.channels = this.options.channels;

            this.renderChannels();
            this.setDefaultChannel();
        },

        post: function(data) {
            var self = this;
            this.isSubmitting = false;

            if (!this.options.get('slackbotUrl')) {
                ga('send', 'event', 'popup', 'redirect', 'missing slackbot url');
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
            .done(function() {
                // Worked, save the channel as the default
                self.saveDefaultChannel(data.channel);
                ga('send', 'event', 'slack', 'post', 'success');
            })
            .fail(function(jqXHR, textStatus) {
                console.log('Unable to post message to slack: ' + textStatus);
                ga('send', 'event', 'slack', 'post', 'fail');
            });
        },

        saveDefaultChannel: function(channel) {
            if (!channel) {
                return;
            }
            this.options.set('defaultChannel', channel);
            this.options.save();
        },

        renderChannels: function() {
            this.$('.favorite-channels').html(this.favoriteChannelTemplate({
                channels: this.channels
            }));
        },

        setDefaultChannel: function() {
            var defaultChannel = this.options.get('defaultChannel');
            if (!defaultChannel) {
                return;
            }

            this.setChannelName(defaultChannel);
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
        },

        handleChannelBlur: function(e) {
            var self = this;
            _.defer(function() {
                if (!$(document.activeElement).hasClass('select-channel')) {
                    self.hideChannels();
                }
            });
        }
    });

    new PopupView();

}(jQuery, Backbone, _, window.ss.OptionsModel));
