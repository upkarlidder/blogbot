var url = require("url");
var request = require('request');

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1');

function main(params) {
  return new Promise((resolve, reject) => {
    if (params && params.nlp) {
      console.log(`NLU for URL: ${params.contentURL}`)
      processURL(params)
        .then(analysisResults => {
          const concepts = analysisResults.concepts.map(concept => concept.text);
          console.log(JSON.stringify(concepts, null, 2));
          resolve({ 'concepts': analysisResults.concepts.map(concept => concept.text) });
        })
        .catch(err => {
          console.log('error:', err);
          reject({ 'error': err })
        });
    }
    else if (params && params.getpicture) {
      console.log(`getting picture for :${params.tag}: from cloudinary`);
      //https://www.sfgate.com/entertainment/article/Disney-s-surprise-stumble-at-Star-Wars-Land-14286892.php
      //https://en.wikipedia.org/wiki/San_Francisco

      var options = {
        url: params.cloudiaryURL,
        method: 'GET',
        qs: { 'tag': params.tag }
      }

      request(options, function (error, response, body) {
        console.log(`response code: ${response.statusCode}`);
        console.log(response);
        if (!error) {
          const resultURL = JSON.parse(body).url;
          console.log(resultURL)
          resolve({ status: resultURL });
        } else {
          console.log(`error : ${error}`);
          reject({ status: error });
        }
      });
    } else {
      reject({ status: 'ERROR! Pass at least one of params.nlp and params.getpicture' });
    }


  })
}

function processURL(params) {
  const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2019-07-12',
    iam_apikey: params.apiKey,
    url: params.nlpUrl,
  });

  const analyzeParams = {
    'url': params.contentURL,
    'features': {
      'entities': {
        'limit': 3,
      },
      'keywords': {
        'limit': 3,
      },
      'concepts': {
        'limit': 3
      }
    },
  };

  return naturalLanguageUnderstanding.analyze(analyzeParams);
}

// main({
//   nlp: true,
//   contentURL: 'https://disneydose.com/top-25-best-disney-blogs-that-you-should-be-reading'
// })