# Krinkle Treasure Hunt 2021

## Development

To preview this locally, start a static web server in this directory,
using [any method you like](https://gist.github.com/willurd/5720255).

For example:

```
python3 -m http.server 4000 -d public_html/
```

Then navigate to <http://localhost:4000/>.

To lint the Python helper script:

```
pip install tox
tox -v
```

## Deployment

```
rsync -av -e ssh --exclude=".DS_Store" public_html/ timotijhof.net:domains/timotijhof.net/treasure21-sub-public_html/
```

<!--

```
# Sync and potentially delete files on the remote
# (make sure you get the remote right, including trailing slash in both paths,
# for otherwise you will delete everything there)
echo rsync -av -e ssh --exclude=".DS_Store" --delete-after  public_html/ example.org:some_place_nice/
```

-->
