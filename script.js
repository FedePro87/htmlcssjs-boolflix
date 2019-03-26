function searchQuery(myQuery,type) {
  var filmWrapper=$(".film-wrapper");
  var seriesWrapper=$(".series-wrapper");
  var noElementsMessage=document.createElement("h1");
  $(noElementsMessage).addClass("noElementsMessage")
  .text("Non sono stati trovati elementi nella categoria");

  $.ajax({
    url:"https://api.themoviedb.org/3/search/" + type,
    method:"GET",
    data:{api_key:"e99307154c6dfb0b4750f6603256716d",query:myQuery,language:"it-IT"},
    success:function(data,state){
      if (data.results.length>0) {
        var results=data.results;
        populateUI(results,type);
      } else {
        if (type=="tv") {
          filmWrapper.append(noElementsMessage);
        } else {
          seriesWrapper.append(noElementsMessage);
        }
      }
    },
    error:function(request,state,error){
      console.log(request);
      console.log(state);
      console.log(error);
    }
  });
}

function populateUI(results,type) {
  var filmWrapper=$(".film-wrapper");
  var seriesWrapper=$(".series-wrapper");
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
        itemId:"tv/" + element.id,
        type:"Serie TV",
        title:element.name,
        originalTitle:element.original_name,
        flag:getLanguageFlag(element.original_language),
        stars:arrStars,
        noStars:arrNoStars,
        posterPathUrl:elementPathUrl,
        itemOverview:element.overview
      }
    } else {
      inData={
        itemId:"movie/" + element.id,
        type:"Film",
        title:element.title,
        originalTitle:element.original_title,
        flag:getLanguageFlag(element.original_language),
        stars:arrStars,
        noStars:arrNoStars,
        posterPathUrl:elementPathUrl,
        itemOverview:element.overview
      }
    }

    var filmInfo= compiled(inData);

    if (type=="movie") {
      filmWrapper.append(filmInfo);
    } else {
      seriesWrapper.append(filmInfo);
    }
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
  var stars=Math.ceil(rating/2);
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
  var filmWrapper=$(".film-wrapper");
  var seriesWrapper=$(".series-wrapper");

  searchInput.on('keydown', function(e) {
    var myQuery=searchInput.val();
    if (e.which == 13) {
      if (myQuery.length>0) {
        //Partono hiddati solo perché per ora non ci sono delle schede film all'inizio.
        $("#film-title").show();
        $("#series-title").show();
        filmWrapper.html("");
        seriesWrapper.html("");
        searchQuery(myQuery,"movie");
        searchQuery(myQuery,"tv");
      } else {
        alert("Immettere un parametro di ricerca!");
      }
    }
  });

  magnifier.click(function functionName() {
    var myQuery=searchInput.val();
    if (myQuery.length>0) {
      //Partono hiddati solo perché per ora non ci sono delle schede film all'inizio.
      $("#film-title").show();
      $("#series-title").show();
      filmWrapper.html("");
      seriesWrapper.html("");
      searchQuery(myQuery,"movie");
      searchQuery(myQuery,"tv");
    } else {
      alert("Immettere un parametro di ricerca!");
    }
  });

  var filmInfo=".info-wrapper .film-info";
  $(document).on("click", filmInfo, function( e ) {
    var me=$(this);
    var itemId=me.data("id");
    window.open("https://www.themoviedb.org/" + itemId + "?language=it-IT",'_blank');
  } );
}

$(document).ready(init);
