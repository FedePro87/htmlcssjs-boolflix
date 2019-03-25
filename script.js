function searchQuery(myQuery,url) {
  $.ajax({
    url:url,
    method:"GET",
    data:{query:myQuery,language:"it-IT"},
    success:function(data,state){
      if (data.results.length>0) {
        var results=data.results;
        populateUI(results);
      }
    },
    error:function(request,state,error){
      console.log(request);
      console.log(state);
      console.log(error);
    }
  });
}

// function searchSeries(myQuery) {
//   $.ajax({
//     url:"https://api.themoviedb.org/3/search/tv?api_key=e99307154c6dfb0b4750f6603256716d",
//     method:"GET",
//     data:{query:myQuery,language:"it-IT"},
//     success:function(data,state){
//       if (data.results.length>0) {
//         var results=data.results;
//         populateUI(results);
//       } else {
//         alert("La ricerca non ha fornito alcun risultato!");
//       }
//     },
//     error:function(request,state,error){
//       console.log(request);
//       console.log(state);
//       console.log(error);
//     }
//   });
// }

function populateUI(results) {
  var infoWrapper=$(".info-wrapper");
  var filmInfoTemplate=$("#film-info-template").html();
  var compiled=Handlebars.compile(filmInfoTemplate);

  for (var i = 0; i < results.length; i++) {
    var element=results[i];
    var elementPathUrl="https://image.tmdb.org/t/p/w342/" + element.poster_path;

    if (element.poster_path==null) {
      elementPathUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPP5IbPgoTmUHAxcFAX9s9bBIJJ026gTMh5qXtTK5xeg7-5tnh"
    }

    var stars=getStars(element.vote_average);
    var noStars=5-stars;
    var arrStars=getArrStars(stars);
    var arrNoStars=getArrStars(noStars);
    var inData={};

    if (element.title==null) {
      inData={
        type:"Serie TV",
        title:element.name,
        originalTitle:element.original_name,
        flag:getLanguageFlag(element.original_language),
        stars:arrStars,
        noStars:arrNoStars,
        posterPathUrl:elementPathUrl
      }
    } else {
      inData={
        type:"Film",
        title:element.title,
        originalTitle:element.original_title,
        flag:getLanguageFlag(element.original_language),
        stars:arrStars,
        noStars:arrNoStars,
        posterPathUrl:elementPathUrl
      }
    }

    var filmInfo= compiled(inData);
    infoWrapper.append(filmInfo);
  }
}

function getArrStars(stars) {
  var arrStars=[];

  for (var i = 0; i < stars; i++) {
    arrStars.push("");
  }

  return arrStars;
}

function getStars(rating) {
  var stars=Math.ceil(rating);
  stars=stars/2;
  stars=Math.ceil(stars);
  return stars;
}

function getLanguageFlag(myLanguage){
  var languageFlagUrl;

  switch (myLanguage) {
    case "it":
    languageFlagUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/2000px-Flag_of_Italy.svg.png"
    break;
    case "nl":
    languageFlagUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/2000px-Flag_of_the_Netherlands.svg.png"
    break;
    case "es":
    languageFlagUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2000px-Flag_of_Spain.svg.png"
    break;
    case "fr":
    languageFlagUrl="http://www.unife.it/studenti/dottorato/it/immagini/bandiera-francese/image_preview"
    break;
    case "en":
    languageFlagUrl="http://www.unife.it/studenti/internazionale/elementicomuni/bandiera-inglese/image"
    break;
    case "el":
    languageFlagUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Greece.svg/2000px-Flag_of_Greece.svg.png"
    break;
    default:
    languageFlagUrl="https://vignette.wikia.nocookie.net/lyricwiki/images/0/06/Flag_-_Unknown.png/revision/latest?cb=20100902075059"
  }

  return languageFlagUrl;
}

function init(){
  var searchInput=$("#search-input");
  var magnifier=$("#magnifier");
  var infoWrapper=$(".info-wrapper");
  var moviesUrl="https://api.themoviedb.org/3/search/movie?api_key=e99307154c6dfb0b4750f6603256716d";
  var seriesUrl="https://api.themoviedb.org/3/search/tv?api_key=e99307154c6dfb0b4750f6603256716d";

  searchInput.on('keydown', function(e) {
    var myQuery=searchInput.val();
    if (e.which == 13) {
      if (myQuery.length>0) {
        infoWrapper.html("");
        searchQuery(myQuery,moviesUrl);
        searchQuery(myQuery,seriesUrl);
      } else {
        alert("Immettere un parametro di ricerca!");
      }
    }
  });

  magnifier.click(function functionName() {
    var myQuery=searchInput.val();
    if (myQuery.length>0) {
      infoWrapper.html("");
      searchQuery(myQuery,moviesUrl);
      searchQuery(myQuery,seriesUrl);
    } else {
      alert("Immettere un parametro di ricerca!");
    }
  });
}

$(document).ready(init);
