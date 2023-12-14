import FileInput from "../components/FileInput";
import ImageCropper from "../components/ImageCropper";
import { useState } from "react";

export default function FileSelector( { sCrop, img, imgState} ) {
    const [image, setImage] = useState(img);
    
    const [currentPage, setCurrentPage] = useState(imgState);
    const [imgAfterCrop, setImgAfterCrop] = useState(img);


    // Invoked when new image file is selected
    const onImageSelected = (selectedImg) => {
      setImage(selectedImg);
      setCurrentPage("crop-img");
    };
  
    // Generating Cropped Image When Done Button Clicked
    const onCropDone = (imgCroppedArea) => {
      const canvasEle = document.createElement("canvas");
      canvasEle.width = imgCroppedArea.width;
      canvasEle.height = imgCroppedArea.height;
  
      const context = canvasEle.getContext("2d");
  
      let imageObj1 = new Image();
      imageObj1.src = image;
      imageObj1.onload = function () {
        context.drawImage(
          imageObj1,
          imgCroppedArea.x,
          imgCroppedArea.y,
          imgCroppedArea.width,
          imgCroppedArea.height,
          0,
          0,
          imgCroppedArea.width,
          imgCroppedArea.height
        );
  
        const dataURL = canvasEle.toDataURL("image/jpeg");
  
        setImgAfterCrop(dataURL);
        sCrop(dataURL);
        setCurrentPage("img-cropped");
      };
    };
  
    // Handle Cancel Button Click
    const onCropCancel = () => {
      setCurrentPage("choose-img");
      setImage("");
    };
    
    return (
    <div className="container">
    {currentPage === "choose-img" ? (
      <FileInput
        setImage={setImage}
        onImageSelected={onImageSelected}
      />
    ) : currentPage === "crop-img" ? (
      <ImageCropper
        image={image}
        onCropDone={onCropDone}
        onCropCancel={onCropCancel}
      />
    ) : (
      <div>
        <div>
          <img src={imgAfterCrop} className="cropped-img" />
        </div>

        {/* <div
          onClick={() => {
            setCurrentPage("crop-img");
          }}
          className="btn"
        >
          Crop
        </div> */}

        <div
          onClick={() => {
            setCurrentPage("choose-img");
            setImage("");
          }}
          className="btn"
        >
          New Image
        </div>
      </div>
    )}
  </div>
  
  );
}

