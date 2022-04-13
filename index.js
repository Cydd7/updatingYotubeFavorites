/*

=>Index
1. Loading and Authentication
2. Declaring and initializing variables
3. Fetching all the playlist and it's items from the youtube account
4. Updating the backup_new fle with all the fetched playlists
5. Making 2 downloadable files - playlists and backup_updated

*/

// 1.
// Loading and Authentication for youtube data api
function authenticate()
{
  return gapi.auth2
    .getAuthInstance()
    .signIn(
    {
      scope: "https://www.googleapis.com/auth/youtube.readonly",
    })
    .then(
      function()
      {
        console.log("Sign-in successful");
      },
      function(err)
      {
        console.error("Error signing in", err);
      }
    );
}

function loadClient()
{
  gapi.client.setApiKey("API_KEY");
  return gapi.client
    .load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(
      function()
      {
        console.log("GAPI client loaded for API");
      },
      function(err)
      {
        console.error("Error loading GAPI client for API", err);
      }
    );
}
gapi.load("client:auth2", function()
{
  gapi.auth2.init(
  {
    client_id: "YOUR_WEB_CLIENT_ID",
  });
});
//__________________________________________________________________________


// 2.
// Declaring and initializing variable to track the value of next page token
// and accumulate all playlists from all pages.
var token;
var playlists = [];
// Initializing variable to track the value of next page token
// and accumulate all playlists items from all pages.
var pItems = [];
var tokenL;
// Accumulating all playlists with their items in allPlaylists.
var allPlaylists = [];
var textFile = null;

var backup;
fetch("allFiles/backup_new.json").then(response => response.json()).then(val =>
{
  backup = val;
});
//__________________________________________________________________________


// 3.
// Make sure the client is loaded and sign-in is complete before calling this method.
function fetchPlaylists()
{
  return gapi.client.youtube.playlists
    .list(
    {
      part: ["snippet,contentDetails"],
      channelId: "UCyoGgvfw8ErOtJhzldpzbiw",
      maxResults: 50,
      pageToken: token,
    })
    .then(
      function(response)
      {
        // Handle the results here (response.result has the parsed body).
        // console.log("Response", response.result);
        token = response.result.nextPageToken;
        playlists = [...playlists, ...response.result.items];
        // console.log(token);
      },
      function(err)
      {
        console.error("Execute error", err);
      }
    );
}

function fetchPlaylistItems(id)
{
  return gapi.client.youtube.playlistItems
    .list(
    {
      part: ["snippet,contentDetails"],
      maxResults: 50,
      playlistId: id,
      pageToken: tokenL,
    })
    .then(
      function(response)
      {
        // Handle the results here (response.result has the parsed body).
        // console.log("Response", response);
        tokenL = response.result.nextPageToken;
        pItems = [...pItems, ...response.result.items];
        // console.log("Indise fun " + tokenL);
      },
      function(err)
      {
        console.error("Execute error", err);
      }
    );
}
// Executing functions fetchPlaylists and fetchPlaylistItems in a systematic manner.
async function executeMultiple()
{
  do {
    // setTimeout(execute, 1000);
    await fetchPlaylists();
    // console.log(playlists);
    console.log("in while -> " + token);
  } while (token);

  for (var i = 0; i < playlists.length; i++)
  {
    console.log(i + 1 + " - " + playlists[i].id);
    do {
      await fetchPlaylistItems(playlists[i].id);
      // console.log("Inside while " + tokenL);
    } while (tokenL);
    console.log(pItems);
    allPlaylists = [...allPlaylists, pItems];
    tokenL = undefined;
    pItems = [];
  }
}
//__________________________________________________________________________


// 4.
function updateSinglePlaylist(i, dir)
{

  for (var j = 1; j <= allPlaylists[i - 1].length; j++)
  {
    var fno = j.toLocaleString('en-US',
    {
      minimumIntegerDigits: 3,
      useGrouping: false
    })

    backup.video.fsItems['dir0_' + dir + '__directory'].files['f' + dir + '_' + fno + '__file'] = 'f' + dir + '_' + fno + '__file';

    backup.video.fsItems['f' + dir + '_' + fno + '__file'] = {
      created: 1648459451770,
      data:
      {
        duration: null,
        durationString: null,
        name: allPlaylists[i - 1][j - 1].snippet.title,
        source: "youtube",
        type: "video",
        videoChannel: allPlaylists[i - 1][j - 1].snippet.videoOwnerChannelId,
        videoChannelAlias: null,
        videoChannelTitle: allPlaylists[i - 1][j - 1].snippet.videoOwnerChannelTitle,
        videoId: allPlaylists[i - 1][j - 1].contentDetails.videoId
      },
      fileSystemId: "qv8g_955__filesystem",
      id: 'f' + dir + '_' + fno + '__file',
      name: allPlaylists[i - 1][j - 1].snippet.title,
      owner: "user",
      parent: 'dir0_' + dir + '__directory',
      permissions:
      {
        delete: true,
        read: true,
        rename: true,
        write: true
      },
      role: "file",
      type: "file",
      updated: 1648459451770
    }
  }
};

function createFile()
{
  for (var i = 1; i <= allPlaylists.length; i++)
  {
    var dir = i.toLocaleString('en-US',
    {
      minimumIntegerDigits: 3,
      useGrouping: false
    })

    backup.video.fsItems.nvmu_956__disk.dirs['dir0_' + dir + '__directory'] = 'dir0_' + dir + '__directory';
    backup.video.fsItems['dir0_' + dir + '__directory'] = {
      created: 1649603769332,
      dirs:
      {},
      fileSystemId: "qv8g_955__filesystem",
      files:
      {},
      id: 'dir0_' + dir + '__directory',
      name: playlists[i - 1].snippet.title,
      owner: "user",
      parent: "nvmu_956__disk",
      permissions:
      {
        delete: true,
        read: true,
        rename: true,
        write: true
      },
      role: "directory",
      type: "directory",
      updated: 1649603769332
    }

    updateSinglePlaylist(i, dir);

  }
  console.log(backup);
}
//__________________________________________________________________________


// 5.
makeTextFile = function(text)
{
  var data = new Blob([text],
  {
    type: "application/json"
  });
  textFile = window.URL.createObjectURL(data);

  return textFile;
};

function makeDownloadFile()
{
  // Create anchor element.
  var a = document.createElement("a");
  var b = document.createElement("a");
  // Create the text node for anchor element.
  var link = document.createTextNode("This is allPlaylists");
  var linkb = document.createTextNode("This is backup_updated");
  // Append the text node to anchor element.
  a.appendChild(link);
  b.appendChild(linkb);

  // Set the title.
  a.title = "This is allPlaylists";
  b.title = "This is backup_updated";

  // Creating the blob of text
  var jsonText = JSON.stringify(allPlaylists);
  var jsonTextb = JSON.stringify(backup);

  // Set the href property.
  a.href = makeTextFile(jsonText);
  b.href = makeTextFile(jsonTextb);
  a.download = "This is allPlaylists";
  b.download = "This is backup_updated";
  // Append the anchor element to the body.
  document.body.appendChild(a);
  document.body.appendChild(document.createElement("br"));
  document.body.appendChild(b);
}
