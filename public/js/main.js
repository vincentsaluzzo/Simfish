$(function(){
	Dropzone.options.myDropZone = {
		autoProcessQueue: false,
		method: "post",
		maxFiles: 1,
		maxFilesize: 10240,
		previewTemplate: '<div class="dz-preview dz-file-preview"> \
				<div class="dz-details"> \
					<div class="dz-filename"><span data-dz-name></span></div> \
					<div class="dz-size" data-dz-size></div> \
					<img data-dz-thumbnail /> \
				</div> \
				<div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div> \
				<div class="dz-success-mark"><span>✔</span></div> \
				<div class="dz-error-mark"><span>✘</span></div> \
				<div class="dz-error-message"><span data-dz-errormessage></span></div> \
				<span class="glyphicon glyphicon-remove-circle dz-remove"></span> \
			</div>',
		init: function() {
			var myDropzone = this;
			$("button#upload-file").on('click', function() {	
				myDropzone.processQueue();
			});

			this.on("addedfile", function(file) { 
				if(myDropzone.files.length >= 2) {
					myDropzone.removeFile(myDropzone.files[0]);
				}

				$(".dz-remove", $(file.previewElement)).click(function () {
					myDropzone.removeFile(file);
				});

				$("#upload-file").removeAttr("disabled");
			});
			
			this.on("removedfile", function(file) {
				$("#upload-file").attr("disabled", "disabled");
			});
			
			this.on("success", function(file, responseText) {
				$("#modal-complete").modal();
				myDropzone.removeAllFiles();
				
				$("#modal-complete-download-link").text(responseText);
				$("#modal-complete-download-link").attr("href", "/download/" + responseText);
				$("#modal-complete-show-link").attr("href", "/view/" + responseText);
				
				
				//file.previewTemplate.appendChild(document.createTextNode(responseText));
			});
		}
	
	};
});