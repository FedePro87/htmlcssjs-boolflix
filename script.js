//Aggiunti bottoni per navigare le pagine, quindi i valori della pagina corrente li salvo in una variabile globale.
var filmPage=1;
var seriesPage=1;
//Per lo stesso motivo, devo differenziare se è nella pagina di ricerca. Difatti se è così farà una ricerca,mentre se è alla pagina iniziale visualizzerà i film più quotati. Dato che deve navigare e che il valore della ricerca viene piallato, mi salvo anche la query stessa.
var isSearching=false;
var searchQuery;

//Funzione che si preoccupa di visualizzare o nascondere i bottoni per navigare tra le pagine.
function toggleSwitchers(data,type,page) {
  var myRightSwitcher;
  var myLeftSwitcher;
  //Se sto cercando nella parte dei film, mi prenderò i suoi bottoni. Stessa cosa per le serie tv.
  if (type=="tv") {
    myRightSwitcher=$(".right-switcher.series-switcher");
    myLeftSwitcher=$(".left-switcher.series-switcher");
  } else {
    myRightSwitcher=$(".right-switcher.film-switcher");
    myLeftSwitcher=$(".left-switcher.film-switcher");
  }
  //Se sono alla pagina 2, è ovvio che sono andato avanti quindi posso mostrare il bottone per tornare indietro. Se invece sono alla prima, non lo mostro.
  if (page>1) {
    myLeftSwitcher.removeClass("hidden");
  } else {
    myLeftSwitcher.addClass("hidden");
  }
  //Se i dati che ricevo sono 20 o meno (quanto basta per riempiere la pagina), nascondo anche il bottone per aumentare la pagina.
  if (data.page<data.total_pages) {
    myRightSwitcher.removeClass("hidden");
  } else {
    myRightSwitcher.addClass("hidden");
  }
}
//Funzione che si preoccupa di modificare i titoli delle due sezioni.
function changeTitles(page,type,hasResults) {
  var filmTitle=$("#film-title");
  var seriesTitle=$("#series-title");
  //Se ci sono risultati...
  if (hasResults) {
    //Se è un film...
    if (type=="tv") {
      //Se ha più di una pagina aggiungo il valore della pagina, altrimenti no.
      if (page>1) {
        seriesTitle.text("Serie TV - Più Popolari - Pagina " + page);
      } else {
        seriesTitle.text("Serie TV - Più Popolari");
      }
    }
    //Se è una serie tv, faccio altrettanto.
    else {
      if (page>1) {
        filmTitle.text("Film - Più Popolari - Pagina " + page);
      } else {
        filmTitle.text("Film - Più Popolari");
      }
    }
  }
  //Se non ci sono risultati, scrivo solamente il titolo.
  else {
    if (type=="tv") {
      seriesTitle.text("Serie TV");
    } else {
      filmTitle.text("Film");
    }
  }
}
//Funzione che si preoccupa di recuperare i 5 attori più importanti. Questi mi verranno passati da data.
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
  //Qui avrò i miei 5 attori, che poi passo alla funzione per aggiungerli alla pagina.
  updateCast(castArray,myId);
}
//Funzione per aggiungere i 5 attori alla pagina. Seleziona le schede film corrette utilizzando un selettore che prende precisamente quel film.
//In fase di creazione della scheda aggiungerò tipo e id dell'elemento, quindi lo sfrutterò qui.
function updateCast(castArray,myId) {
  var myFilm=$(".film-info[data-id='" + myId + "']");
  var mySpan= myFilm.find(".cast");
  mySpan.text(castArray);
}
//Autoesplicativa.
function getNoElementsWarning() {
  var noElementsMessage=document.createElement("h1");
  $(noElementsMessage).addClass("noElementsMessage")
  .text("Non sono stati trovati elementi nella categoria");
  return noElementsMessage;
}
//Mega funzione che praticamente si occupa di gestire qualsiasi chiamata al nostro database.
//In action generalmente è passata la richiesta.
//In type generalmente "tv" oppure "movie".
//In page generalmente il numero di pagina.
function requestAjaxTmdb(action,type,myQuery,page) {
  var filmWrapper=$(".film-wrapper");
  var seriesWrapper=$(".series-wrapper");
  var myUrl;
  var myPage;
  //Qui arrivo nel caso in cui passerò come action "genre".Ciò avviene quando mi vado a recuperare tutti i generi dal database.
  //In quel caso, cambio la url perchè è diversa perché aggiunge anche "/list".
  //Paradossalmente non ottengo errori pur passando ulteriori argomenti più avanti nell'oggetto data.
  //A questo punto page non sarà il numero di pagina (ovviamente, dato che stiamo facendo una ricerca di generi), quindi otterrei un errore se gli passassi l'id del film che mi interessa.
  //Per ovviare al problema, lascio page inalterato per utilizzarlo così come lo avevo pensato e cambio solo il valore di myPage, che nel caso delle ricerche e della pagina iniziale sarà quello normale. Nel caso in cui sto cercando la lista di generi, gli passo un numero qualsiasi che non mi dia errore(in questo caso 1).
  if (action=="genre") {
    myUrl="https://api.themoviedb.org/3/" + action + "/" + type + "/list";
    myPage=1;
  }
  //Qui si arriva sia se sono alla prima pagina che se sono nella ricerca o sto navigando tra le pagine.
  else {
    myUrl="https://api.themoviedb.org/3/" + action + "/" + type;
    myPage=page;
  }

  $.ajax({
    url:myUrl,
    method:"GET",
    //Oltre alle solite chiavi c'è append to response, che mi fornisce l'informazione ulteriore del cast che compone il film.
    data:{api_key:"e99307154c6dfb0b4750f6603256716d",query:myQuery,language:"it-IT",page:myPage,append_to_response:"credits"},
    success:function(data,state){
      //Qui arriverò sia se mi serve il cast di un film che di una serie tv.
      if (action=="movie"||action=="tv") {
        getCast(action,data);
      }
      //Qui arriverò quando mi serviranno i generi.
      else if (action=="genre") {
        getGenresName(data.genres,myQuery,page,type);
      }
      //Qui arriverò dalla pagina iniziale, dalla ricerca o dal cambio di pagina.
      else{
        //Se ci sono risultati faccio qualcosa, altrimenti scrivo solo un messaggio Autoesplicativo.
        if (data.results.length>0) {
          var results=data.results;
          populateUI(results,type);
          toggleSwitchers(data,type,page);
          changeTitles(page,type,true);
        } else {
          if (type=="tv") {
            seriesWrapper.append(getNoElementsWarning());
          } else {
            filmWrapper.append(getNoElementsWarning());
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
//Genera un array con i generi del film, che poi verrà confrontato con tutti i generi per ottenere il nome vero.
function getElementGenresArray(elementGenres) {
  var splittedGenres=elementGenres.split(",");
  return splittedGenres;
}
//Funzione che confronta l'array di generi che mi viene dal database all'array di generi del singolo film.
//Considerando che sono di meno quelli dei singolo elemento, faccio prima a confrontare un singolo genere con tutti i generi.
//Se lo trovo, aggiungo il vero nome del genere alla mia lista. Infine la passo alla funzione che si occuperà di scrivere i risultati sulla pagina.
function getGenresName(genres,elementGenres,myId,type) {
  var myGenresName=[];
  var id=type+"/"+myId;
  elementGenres=getElementGenresArray(elementGenres);
  for (var i = 0; i < elementGenres.length; i++) {
    var element=elementGenres[i];
    for (var z = 0; z < genres.length; z++) {
      if (element==genres[z].id) {
        myGenresName.push(genres[z].name);
        break;
      }
    }
  }
  updateGenres(myGenresName,id);
}
//Funzione identica a quella del cast, solo che aggiunge i generi.
function updateGenres(myGenres,myId) {
  var myFilm=$(".film-info[data-id='" + myId + "']");
  var mySpan= myFilm.find(".genres");
  mySpan.text(myGenres);
}
//Funzione che viene chiamata all'inizio, quando cerchiamo e quando andiamo avanti o dietro nella pagina.
function populateUI(results,type) {
  var filmWrapper=$(".film-wrapper");
  var seriesWrapper=$(".series-wrapper");
  var filmInfoTemplate=$("#film-info-template").html();
  var compiled=Handlebars.compile(filmInfoTemplate);

  for (var i = 0; i < results.length; i++) {
    var element=results[i];
    var elementPathUrl="https://image.tmdb.org/t/p/w342/" + element.poster_path;
    //Se non risulta nessun indirizzo al poster del film, mostro una locandina con un punto interrogativo.
    if (element.poster_path==null) {
      elementPathUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPP5IbPgoTmUHAxcFAX9s9bBIJJ026gTMh5qXtTK5xeg7-5tnh"
    }

    var stars=getStars(element.vote_average);
    var inData={};

    if (type=="tv") {
      inData={
        //Una parte importantissima, perché imposto il data-id così da potermi recuperare lo specifico film più tardi.
        itemId:"tv/" + element.id,
        itemGenres:element.genre_ids,
        title:element.name,
        originalTitle:element.original_name,
        //Recupero la lingua originale e lo passo alla funzione che si occuperà di assegnarmi una src dell'immagine in base al paese.
        flag:getLanguageFlag(element.original_language),
        //Qui utilizzo Handlebars con il suo foreach. Per ogni elemento dell'array stampa una stella.
        //Gli elementi dell'array sono spazi vuoti perché così non scrive altro oltre la stella.
        stars:getArrStars(stars),
        noStars:getArrStars(5-stars),
        posterPathUrl:elementPathUrl,
        itemOverview:element.overview
      }
    } else {
      inData={
        itemId:"movie/" + element.id,
        itemGenres:element.genre_ids,
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
//Come detto prima, genera array vuoti per creare le stelle.
function getArrStars(stars) {
  var arrStars=[];

  for (var i = 0; i < stars; i++) {
    arrStars.push("");
  }

  return arrStars;
}
//Autoesplicativo.
function getStars(rating) {
  var stars=Math.ceil(rating/2);
  return stars;
}
//Con uno switch assegno un'url al src della bandiera.
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
//Bindo la stessa funzione a due eventi, ovvero l'enter sulla ricerca e la pressione della lente d'ingrandimento.
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
//Ogni volta che cerco, la pagina sarà di nuovo impostata a 1.
function searchApi(myQuery) {
  var filmWrapper=$(".film-wrapper");
  var seriesWrapper=$(".series-wrapper");
  filmPage=1;
  seriesPage=1;
  searchQuery=myQuery;
  //Se inserisco dei termini parte la ricerca e piallo il contenuto dei due contenitori, altrimenti mostro un alert.
  if (myQuery.length>0) {
    filmWrapper.html("");
    seriesWrapper.html("");
    //Con la solita funzione passo gli argomenti corretti per raggiungere il mio scopo.
    requestAjaxTmdb("search","movie",myQuery,filmPage);
    requestAjaxTmdb("search","tv",myQuery,seriesPage);
    isSearching=true;
  } else {
    alert("Immettere un parametro di ricerca!");
  }
}
//Con un selettore dinamico bindo un evento al click dei film.
//Questo evento sfrutta il fatto che sul sito di TMDB le schede dei film sono contrassegnate dal tipo e dall'id.
//In fase di creazione delle schede dei film mi sono già creato il data-id, che sfrutto anche qui per conoscere l'id del film cliccato.
function initOpenFilmPage() {
  var filmInfo=".info-wrapper .film-info";
  $(document).on("click", filmInfo, function(e) {
    var me=$(this);
    var itemId=me.data("id");
    window.open("https://www.themoviedb.org/" + itemId + "?language=it-IT",'_blank');
  });
}

function initFilmInfoHover() {
  var filmInfo=".info-wrapper .film-info";
  var showed=false;
  $(document).on("mouseenter", filmInfo, function() {
    var me = $(this);
    var elementId=me.data("id");
    var elementGenres=me.data("genres");
    var elementType;
    var elementId;
    if (!showed) {
      showed=true;
      var splittedId=elementId.split("/");
      elementType=splittedId[0];
      elementId=splittedId[1];
    }
    //Qui andrò a chiamare sempre la solita megafunzione.
    //L'action "tv" oppure "movie" mi collegherà poi ai metodi per aggiungere i cast ai film.
    requestAjaxTmdb(elementType,elementId,"",1);
    //Qui mi andrò prima a recuperare tutti i generi per poi passarmi tutto ciò che mi serve per aggiungerli alla pagina.
    //Action "genre" farà in modo di avere l'url del database giusta, oltre che alla pagina per evitare un bug.
    requestAjaxTmdb("genre",elementType,elementGenres,elementId);
  });

  $(document).on("mouseleave", filmInfo, function() {
    showed=false;
  });
}
//All'inizio mi ritroverò qui.
function initStartUI() {
  requestAjaxTmdb("discover","movie","",filmPage);
  requestAjaxTmdb("discover","tv","",seriesPage);
}
//Questa funzione si triggera al click dei bottoni per navigare la pagina.
//Next dice se stiamo andando avanti o meno.
//isSearching è Autoesplicativa.
//Se stiamo cercando, non saremo più alla pagina iniziale, quindi sfrutteremo l'action "search".
//Se non stiamo cercando siamo ancora alla pagina iniziale, quindi sfrutteremo "discover".
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
  //Se schiaccio i bottoni avanti o dietro dei rispettivi container ottengo l'effetto desiderato.
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
  //Faccio scrollare fino al titolo del container che mi interessa e ne piallo il contenuto.
  $('html,body').animate({scrollTop: myTitle.offset().top},1000);
  myWrapper.html("");
}
//Bindo la funzione degli switcher agli eventi.
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
//Funzione che si preoccupa di ricreare la situazione iniziale quando schiaccio il logo di Netflix.
function initBoolflixClick() {
  var boolflixImg=$(".header-wrapper>img");

  boolflixImg.click(function(){
    window.location.reload(true);
  });
}

function init(){
  initStartUI();
  initBoolflixClick();
  initSwitchPages();
  initSearch();
  initOpenFilmPage();
  initFilmInfoHover();
}

$(document).ready(init);
