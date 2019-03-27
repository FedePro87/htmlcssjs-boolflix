var filmPage=1;
var seriesPage=1;
var isSearching=false;
var searchQuery;

function toggleSwitchers(data,type,page) {
  var myRightSwitcher;
  var myLeftSwitcher;

  if (type=="tv") {
    myRightSwitcher=$(".right-switcher.series-switcher");
    myLeftSwitcher=$(".left-switcher.series-switcher");
  } else {
    myRightSwitcher=$(".right-switcher.film-switcher");
    myLeftSwitcher=$(".left-switcher.film-switcher");
  }

  if (page>1) {
    myLeftSwitcher.removeClass("hidden");
  } else {
    myLeftSwitcher.addClass("hidden");
  }

  if (data.page<data.total_pages) {
    myRightSwitcher.removeClass("hidden");
  } else {
    myRightSwitcher.addClass("hidden");
  }
}

function changeTitles(page,type,hasResults) {
  var filmTitle=$("#film-title");
  var seriesTitle=$("#series-title");

  if (hasResults) {
    if (type=="tv") {
      if (page>1) {
        seriesTitle.text("Serie TV - Più Popolari - Pagina " + page);
      } else {
        seriesTitle.text("Serie TV - Più Popolari");
      }
    } else {
      if (page>1) {
        filmTitle.text("Film - Più Popolari - Pagina " + page);
      } else {
        filmTitle.text("Film - Più Popolari");
      }
    }
  } else {
    if (type=="tv") {
      seriesTitle.text("Serie TV");
    } else {
      filmTitle.text("Film");
    }
  }
}

function getCast(action,data) {
  var myId=action + "/" + data.id;
  var credits=data.credits;
  var cast= credits.cast;
  var castArray=[];

  for (var i = 0; i <5; i++) {
    var element=cast[i];
    if (element!=null) {
      castArray.push(element.name);
    }
  }
  updateCast(castArray,myId);
}

function updateCast(castArray,myId) {
  var myFilm=$(".film-info[data-id='" + myId + "']");
  var mySpan= myFilm.find(".cast");
  mySpan.text(castArray);
}

function requestAjaxTmdb(action,type,myQuery,page) {
  var filmWrapper=$(".film-wrapper");
  var seriesWrapper=$(".series-wrapper");
  var noElementsMessage=document.createElement("h1");
  $(noElementsMessage).addClass("noElementsMessage")
  .text("Non sono stati trovati elementi nella categoria");

  $.ajax({
    url:"https://api.themoviedb.org/3/" + action + "/" + type,
    method:"GET",
    data:{api_key:"e99307154c6dfb0b4750f6603256716d",query:myQuery,language:"it-IT",page:page,append_to_response:"credits"},
    success:function(data,state){
      if (action=="movie"||action=="tv") {
        getCast(action,data);
      } else{
        if (data.results.length>0) {
          var results=data.results;
          populateUI(results,type);
          toggleSwitchers(data,type,page);
          changeTitles(page,type,true);
        } else {
          if (type=="tv") {
            seriesWrapper.append(noElementsMessage);
          } else {
            filmWrapper.append(noElementsMessage);
          }
          toggleSwitchers(data,type,page);
          changeTitles(page,type,false);
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
    var inData={};

    if (type=="tv") {
      inData={
        itemId:"tv/" + element.id,
        cast:requestAjaxTmdb("tv",element.id,"",1),
        title:element.name,
        originalTitle:element.original_name,
        flag:getLanguageFlag(element.original_language),
        stars:getArrStars(stars),
        noStars:getArrStars(5-stars),
        posterPathUrl:elementPathUrl,
        itemOverview:element.overview
      }
    } else {
      inData={
        itemId:"movie/" + element.id,
        cast:requestAjaxTmdb("movie",element.id,"",1),
        title:element.title,
        originalTitle:element.original_title,
        flag:getLanguageFlag(element.original_language),
        stars:getArrStars(stars),
        noStars:getArrStars(5-stars),
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

function initSearch() {
  var searchInput=$("#search-input");
  var magnifier=$("#magnifier");
  var filmWrapper=$(".film-wrapper");
  var seriesWrapper=$(".series-wrapper");
  var myQuery;

  searchInput.on('keydown',function(e) {
    if (e.which == 13) {
      myQuery=searchInput.val();
      searchApi(myQuery);
      searchInput.val("");
    }
  });

  magnifier.click(function() {
    myQuery=searchInput.val();
    searchApi(myQuery);
    searchInput.val("");
  });
}

function searchApi(myQuery) {
  var filmWrapper=$(".film-wrapper");
  var seriesWrapper=$(".series-wrapper");
  filmPage=1;
  seriesPage=1;
  searchQuery=myQuery;
  if (myQuery.length>0) {
    filmWrapper.html("");
    seriesWrapper.html("");
    requestAjaxTmdb("search","movie",myQuery,filmPage);
    requestAjaxTmdb("search","tv",myQuery,seriesPage);
    isSearching=true;
  } else {
    alert("Immettere un parametro di ricerca!");
  }
}

function initOpenFilmPage() {
  var filmInfo=".info-wrapper .film-info";
  $(document).on("click", filmInfo, function(e) {
    var me=$(this);
    var itemId=me.data("id");
    window.open("https://www.themoviedb.org/" + itemId + "?language=it-IT",'_blank');
  });
}

function initStartUI() {
  requestAjaxTmdb("discover","movie","",filmPage);
  requestAjaxTmdb("discover","tv","",seriesPage);
}

function switchPage(next,type) {
  var myWrapper;
  var myTitle;
  var myQuery;

  if (isSearching) {
    myAction="search";
    myQuery=searchQuery;
  } else {
    myAction="discover";
    myQuery="";
  }

  if (type=="tv") {
    myWrapper=$(".series-wrapper");
    myTitle=$("#series-title");
    if (next) {
      seriesPage++;
    } else {
      seriesPage--;
    }
    requestAjaxTmdb(myAction,"tv",myQuery,seriesPage);
  } else {
    myWrapper=$(".film-wrapper");
    myTitle=$("#film-title");
    if (next) {
      filmPage++;
    } else {
      filmPage--;
    }
    requestAjaxTmdb(myAction,"movie",myQuery,filmPage);
  }

  $('html,body').animate({scrollTop: myTitle.offset().top},1000);
  myWrapper.html("");
}

function initSwitchPages() {
  var filmSwitcherLeft=$(".left-switcher.film-switcher");
  var filmSwitcherRight=$(".right-switcher.film-switcher");
  var seriesSwitcherLeft=$(".left-switcher.series-switcher");
  var seriesSwitcherRight=$(".right-switcher.series-switcher");

  filmSwitcherLeft.click(function() {switchPage(false,"movie");});
  filmSwitcherRight.click(function() {switchPage(true,"movie");});
  seriesSwitcherLeft.click(function() {switchPage(false,"tv");});
  seriesSwitcherRight.click(function() {switchPage(true,"tv");});
}

function initBoolflixClick() {
  var boolflixImg=$(".header-wrapper>img");

  boolflixImg.click(function(){
    var filmWrapper=$(".film-wrapper");
    var seriesWrapper=$(".series-wrapper");
    filmWrapper.html("");
    seriesWrapper.html("");
    initStartUI();
  });
}

function init(){
  initStartUI();
  initBoolflixClick();
  initSwitchPages();
  initSearch();
  initOpenFilmPage();
}

$(document).ready(init);
