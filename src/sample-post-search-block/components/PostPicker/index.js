import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';

import {
	Button,
	CheckboxControl,
	Flex,
	FlexItem,
	Modal,
	Notice,
	SearchControl,
	Spinner,
	ToolbarButton,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';

import TermSelector from '../TermSelector';

function PostList( props ) {
	const {
		postType,
		queryArgs,
		queriedPosts: externalPosts,
		onChange,
		values = [],
	} = props;

	const fetchedPosts = useSelect(
		( select ) => {
			if ( externalPosts ) {
				return null;
			}
			return (
				select( 'core' ).getEntityRecords(
					'postType',
					postType,
					queryArgs
				) ?? []
			);
		},
		[ postType, queryArgs, externalPosts ]
	);

	const queriedPosts = externalPosts ?? fetchedPosts ?? [];

	const isResolving = useSelect(
		( select ) => {
			return select( 'core' ).isResolving( 'getEntityRecords', [
				'postType',
				postType,
				queryArgs,
			] );
		},
		[ postType, queryArgs ]
	);

	return (
		<div
			style={ {
				marginTop: -24,
				paddingTop: 24,
				paddingLeft: 4,
				marginLeft: -4,
			} }
		>
			{ ( isResolving && <Spinner /> ) ||
				( queriedPosts.length < 1 && (
					<Notice isDismissible={ false }>
						{ __( 'No results found', 'sample-plugin' ) }
					</Notice>
				) ) ||
				queriedPosts.map( ( post ) => (
					<div key={ post.id } style={ { paddingBottom: 8 } }>
						<CheckboxControl
							checked={ values.includes( post.id ) }
							label={
								post.title?.rendered ||
								__( '(No title)', 'sample-plugin' )
							}
							onChange={ ( checked ) => {
								if ( checked ) {
									onChange( [ ...values, post.id ] );
								} else {
									onChange(
										values.filter(
											( value ) => value !== post.id
										)
									);
								}
							} }
						/>
					</div>
				) ) }
		</div>
	);
}

function BrowsePanel( props ) {
	const { postType, onChange, values, taxonomies } = props;

	const [ search, setSearch ] = useState( '' );
	const [ page, setPage ] = useState( 1 );

	const taxObjects = useSelect(
		( select ) => {
			return taxonomies.map( ( taxonomy ) =>
				select( 'core' ).getTaxonomy( taxonomy )
			);
		},
		[ taxonomies ]
	);

	const [ taxQueries, setTaxQueries ] = useState( {} );

	const updateTaxQueryState = useCallback(
		( taxonomy, newTerms ) => {
			const taxObject = taxObjects.find(
				( t ) => t && t.slug === taxonomy
			);
			if ( taxObject ) {
				setTaxQueries( {
					...taxQueries,
					[ taxObject.rest_base ]: newTerms,
				} );
			}
		},
		[ taxQueries, taxObjects ]
	);

	// Reset to page 1 whenever search or taxonomy filters change.
	useEffect( () => {
		setPage( 1 );
	}, [ search, taxQueries ] );

	const searchId =
		search && /^\d+$/.test( search.trim() )
			? parseInt( search.trim(), 10 )
			: null;

	const queryArgs = useMemo(
		() => ( {
			...( searchId
				? { include: [ searchId ] }
				: { search: search || undefined } ),
			per_page: 10,
			page,
			...taxQueries,
			context: 'view',
		} ),
		[ searchId, search, page, taxQueries ]
	);

	const { queriedPosts, totalPages } = useSelect(
		( select ) => {
			return {
				queriedPosts:
					select( 'core' ).getEntityRecords(
						'postType',
						postType,
						queryArgs
					) ?? [],
				totalPages:
					select( 'core' ).getEntityRecordsTotalPages(
						'postType',
						postType,
						queryArgs
					) ?? 1,
			};
		},
		[ postType, queryArgs ]
	);

	return (
		<Flex align="flex-start" style={ { gap: 24 } }>
			<FlexItem style={ { width: '35%' } }>
				<SearchControl
					label={ __( 'Search Posts', 'sample-plugin' ) }
					value={ search }
					onChange={ ( text ) => setSearch( text ) }
				/>
				<p
					style={ {
						marginTop: 4,
						marginBottom: 24,
						fontSize: 12,
						color: '#757575',
					} }
				>
					{ __(
						'Search by title or enter a post ID.',
						'sample-plugin'
					) }
				</p>
				{ taxonomies.map( ( taxonomy ) => {
					const taxObject = taxObjects.find(
						( t ) => t && t.slug === taxonomy
					);
					return taxObject ? (
						<TermSelector
							key={ taxonomy }
							taxonomy={ taxonomy }
							value={ taxQueries[ taxObject.rest_base ] }
							onChange={ ( terms ) =>
								updateTaxQueryState( taxonomy, terms )
							}
						/>
					) : null;
				} ) }
			</FlexItem>
			<FlexItem style={ { width: '65%' } }>
				<PostList
					postType={ postType }
					queryArgs={ queryArgs }
					queriedPosts={ queriedPosts }
					values={ values }
					onChange={ onChange }
				/>
				<Flex justify="space-between" style={ { marginTop: 16 } }>
					<Button
						variant="secondary"
						disabled={ page === 1 }
						onClick={ () => setPage( ( p ) => p - 1 ) }
					>
						{ __( 'Previous', 'sample-plugin' ) }
					</Button>
					<span style={ { fontSize: 12, color: '#757575' } }>
						{ sprintf(
							/* translators: 1: current page number, 2: total number of pages. */
							__( 'Page %1$d of %2$d', 'sample-plugin' ),
							page,
							totalPages
						) }
					</span>
					<Button
						variant="secondary"
						disabled={ page >= totalPages }
						onClick={ () => setPage( ( p ) => p + 1 ) }
					>
						{ __( 'Next', 'sample-plugin' ) }
					</Button>
				</Flex>
			</FlexItem>
		</Flex>
	);
}

export function PostPickerModal( props ) {
	const {
		title,
		postType = 'post',
		taxonomies = [],
		values = [],
		maxItems = Infinity,
		onChange,
		setModalOpen,
	} = props;

	const [ pendingValues, setPendingValues ] = useState( values );

	const handleChange = ( ids ) => {
		const added = ids.find( ( id ) => ! pendingValues.includes( id ) );
		if ( added ) {
			if ( maxItems === 1 ) {
				setPendingValues( [ added ] );
			} else if ( pendingValues.length < maxItems ) {
				setPendingValues( [ ...pendingValues, added ] );
			}
		} else {
			setPendingValues( ids );
		}
	};

	const handleConfirm = () => {
		onChange( pendingValues );
		setModalOpen( false );
	};

	return (
		<Modal
			style={ { width: '800px', maxWidth: '100%' } }
			title={ title }
			onRequestClose={ () => setModalOpen( false ) }
		>
			<div>
				<BrowsePanel
					postType={ postType }
					taxonomies={ taxonomies }
					values={ pendingValues }
					onChange={ handleChange }
				/>
				<Flex
					justify="flex-end"
					style={ {
						marginTop: 24,
						paddingTop: 16,
						borderTop: '1px solid #ddd',
					} }
				>
					<Button variant="primary" onClick={ handleConfirm }>
						{ __( 'Select Post', 'sample-plugin' ) }
					</Button>
				</Flex>
			</div>
		</Modal>
	);
}

export function PostPickerToolbarButton( props ) {
	const {
		title = __( 'Select post', 'sample-plugin' ),
		icon = 'edit',
		maxItems = Infinity,
		postType,
		taxonomies,
		values,
		onChange,
	} = props;

	const [ modalOpen, setModalOpen ] = useState( false );

	return (
		<>
			<ToolbarButton
				icon={ icon }
				label={ title }
				onClick={ () => setModalOpen( true ) }
			>
				{ title }
			</ToolbarButton>
			{ modalOpen && (
				<PostPickerModal
					title={ title }
					postType={ postType }
					taxonomies={ taxonomies }
					values={ values }
					onChange={ onChange }
					maxItems={ maxItems }
					setModalOpen={ setModalOpen }
				/>
			) }
		</>
	);
}

export function PostPickerButton( props ) {
	const {
		title = __( 'Select post', 'sample-plugin' ),
		maxItems = Infinity,
		postType,
		taxonomies,
		values,
		onChange,
	} = props;

	const [ modalOpen, setModalOpen ] = useState( false );

	return (
		<>
			<Button variant="primary" onClick={ () => setModalOpen( true ) }>
				{ title }
			</Button>
			{ modalOpen && (
				<PostPickerModal
					title={ title }
					postType={ postType }
					taxonomies={ taxonomies }
					values={ values }
					onChange={ onChange }
					maxItems={ maxItems }
					setModalOpen={ setModalOpen }
				/>
			) }
		</>
	);
}
