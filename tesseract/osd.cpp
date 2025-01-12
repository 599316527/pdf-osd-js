#include <iostream>
#include <leptonica/allheaders.h>
#include <tesseract/baseapi.h>
#include <emscripten.h>
#include "emscripten/bind.h"
#include <string>
#include <sstream>

using namespace emscripten;

tesseract::TessBaseAPI* api;

int main() {
    api = new tesseract::TessBaseAPI();
    printf("Tesseract-ocr version: %s\n", api->Version());

    // Init osd engine with osd.traineddata 
    api->Init("model/", "osd");
    api->SetPageSegMode(tesseract::PSM_OSD_ONLY);

    // tell JS the engine is ready
    EM_ASM(
        Module.onOsdEngineReady();
    );

    return 0;
}

std::string detectOrientationScript(std::string filename)
{
    PIX* image = pixRead(filename.c_str());
    api->SetImage(image);

    int orient_deg;
    float orient_conf;
    const char* script_name;
    float script_conf;
    api->DetectOrientationScript(&orient_deg, &orient_conf, &script_name, &script_conf);
    // printf("************\n Orientation in degrees: %d\n Orientation confidence: %.2f\n"
    //     " Script: %s\n Script confidence: %.2f\n",
    //     orient_deg, orient_conf,
    //     script_name, script_conf);

    pixDestroy(&image);
    
    std::stringstream json;
    json.precision(5);  // 设置浮点数精度为2位小数
    json << std::fixed;
    
    json << "{";
    json << "\"orient_deg\":" << orient_deg << ",";
    json << "\"orient_conf\":" << orient_conf << ",";
    json << "\"script_name\":\"" << script_name << "\",";
    json << "\"script_conf\":" << script_conf;
    json << "}";
    
    return json.str();
}

EMSCRIPTEN_BINDINGS(my_module)
{
    function("detectOrientationScript", &detectOrientationScript);
}