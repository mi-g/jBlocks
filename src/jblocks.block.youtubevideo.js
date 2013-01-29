/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @author mig <michel.gutierrez@gmail.com>
 * @version 0.1
 * @module jBlocks 
 * @overview Javascript library for automatic responsive design oriented layouts. 
 */

/**
 * <p>A YouTubeVideo block displays an embedded video from YouTube.</p>
 * <p>The constructor should not be invoked directly but {@link JBlocks#newBlock} or {@link JBlocks#addNewBlock} should be used instead.</p>
 * @name YouTubeVideo
 * @class Define a YouTubeVideo block to be displayed into a JBlocks.
 * @augments Icon
 */
$.jBlocks("defineBlockClass","YouTubeVideo","IFrame",{
	/**
	 * Initializes a MenuIcon block.
	 * The method is invoked by the jBlocks core and must never be called directly.
	 * @name YouTubeVideo#init
	 * @function
	 * @param {Object} [layout] see {@link Block#init}.
	 * @param {Object} [options] in addition to base class options {@link IFrame#init}:
	 * @param {Array} [options.youtubeID] the ID of the video at YouTube.
	 */
	init: function() {
		this._super.apply(this,arguments);
		$.extend(this.options,{
			src: "http://www.youtube.com/embed/"+this.options.youtubeID,
		});
		this.options=$.extend({
			blockContentClass: "jblocks-block-video",
		},this.options);
	},
});
