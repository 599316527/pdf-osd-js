# ensure deps are installed first
vcpkg install tesseract:wasm32-emscripten --overlay-triplets=./custom-triplets

# build wasm
emcc osd.cpp -o osd.html -I vcpkg/installed/wasm32-emscripten/include -L vcpkg/installed/wasm32-emscripten/lib -l archive -l bz2 -l crypto -l curl -l gif -l jpeg -l leptonica -l lz4 -l lzma -l openjp2 -l png -l png16 -l sharpyuv -l ssl -l tiff -l turbojpeg -l webp -l webpdecoder -l webpdemux -l webpmux -l xml2 -l z -l zstd -l tesseract --preload-file model/osd.traineddata -lembind -sALLOW_MEMORY_GROWTH=1
