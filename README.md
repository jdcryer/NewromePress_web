![angular](https://img.shields.io/badge/angular-^13.3.0-lightgrey.svg?style=flat-square&logo=angular)

# NewromePress Admin

## Adding New View Modules via ng generate


Generate a new "resource".module.ts and "resource"-routing.module.ts with the below command.
Below examples all use the value 'scan-item'. This should be replaced with your resource name.

```bash
ng generate module views/scan-item --route views/scan-item --module app.module
```

This can also be shorted slightly like so

```bash
ng g m views/scan-item --route views/scan-item --module app.module
```

This will generate a 'scan-item' folder in 'views' with 6 files because this command also creates a 'scan-item' component that we do not need
So, first delete the following four files:

```bash
views/scan-item/scan-item.component.html
views/scan-item/scan-item.component.scss
views/scan-item/scan-item.component.ts
views/scan-item/scan-item.component.spec.ts
```

Then remove any refereces to 'ScanItemComponent' from scan-item.module.ts and scan-item-routing.module.ts

Now, make ammendments to app-routing.module.ts so our new module is loaded as a child of the DefaultLayout

```javascript
{
	path: '',
	component: DefaultLayoutComponent,
	data: { title: 'Home' },
	resolve: { navBar: NavBarResolver },
	children: [
		//Other modules ...

		//Add this object
		{
			path: 'scan-item',
			loadChildren: () =>
				import ('./views/scan-item/scan-item.module').then((m) => m.ScanItemModule),
		}
	],
},
//Delete this object that was automatically created
{ path: 'views/scan-item', loadChildren: () => import('./views/scan-item/scan-item.module').then(m => m.ScanItemModule) },
```

Next, create the components we want to keep.

The below example uses two commands to create a listing and detail component and import them into our scan-item module

```bash
ng g c views/scan-item/scan-item-listing --module views/scan-item
ng g c views/scan-item/scan-item-detail --module views/scan-item
```

Now add references to these two components to scan-item-routing.module.ts

```javascript
{ path: '', redirectTo: 'scan-item-listing' },
{
	path: 'scan-item-listing',
	component: ScanItemListingComponent,
	resolve: { lang: LangResolverService, gridDef: GridDefResolverService }
},
{
	path: 'scan-item-detail/:id',
	component: ScanItemDetailComponent,
	resolve: { data: DetailResolverService },
},
{
	path: 'scan-item-detail',
	component: ScanItemDetailComponent
}
```

