let nl = '\n\n';
vars.story.introText  = 'Ever since the attack in 1978, aliens have been trying to invade our space. In this year the great battle plan "TAITO" was voted for and initiated.' + nl;
vars.story.introText += 'After constant bombardment from these "space invaders", 1980 saw a new specialised group set up to deal with the increasing aggression, the infamous AtariCollective or AC. Each member of which coming from one of the 26 major countries on earth.' + nl;
vars.story.introText += '2 years after the AC was set up they increased their membership to include a total of 52 countries. This boost in member countries meant that our technology would only be getting better.' + nl;
vars.story.introText += 'In 1985, the "Natural Extraterrestrial Solutions" group (NES) invented the SG-1000 cannon which propelled electrified plasma at the enemy. This new technology appeared just in time and rendered the enemies new armour useless. Coincidence or Luck? We didnt find that out for many years*...' + nl;

vars.story.introText += 'In the years between 1985 and 1998 we saw very few differences in the enemy technology... Then 1999 happened. This time the space invaders attacked and brought with them a new, more frightening weapon. Not only had the enemy somehow gotten a hold of our weapons technology, they brought the "shade field" (commonly called WonderSwan after a local legend). This field removed all color from the surrounding area. The skies were a brilliant white and the only things visible within the field were us, the enemy and our weapons... all of which were completely black! Like all the light had been ripped from the area.' + nl;
vars.story.introText += 'We had to do something about this new shade field as it was causing our brave men and women to go blind after extended fighting in the field. It eventually became clear that a new type of enemy mother ship was the source of the field. It was completely by accident that we discovered this new type of ship, which was ingeniously masking its main difference (a simple color change of its hull to blue!), hidden behind the effect of the shade field. A total of 300 brave souls were sent to destroy the field, none of which came back. A sad day for the human race indeed. Thankfully the field was never used again (see footnote). We assumed (correctly) that it was a prototype rushed into commission after intercepting a signal sent out just before the mother ship was destroyed (later decoded as proof of it being the only one of its type: class: disruptor v0.9beta).' + nl;
vars.story.introText += 'Shortly after, in 2002, the caplet weapon type was developed, outperforming the original electrified plasma weapons of the 1990s in every test we threw at it. They are extremely dangerous, but currently the enemys armor is taking the same strides we are recently, meaning we have to hit the enemy several times before they are sent back to wherever they came from...' + nl;
vars.story.introText += 'In 2007 we set up the Mobile Android Array and the enemy turned up with a new set of evasive manoeuvres, but the massive influx of fighters in this year meant that we outnumbered the enemy 10,000 to 1 and we easily won the war.' + nl;
vars.story.introText += 'A mere 2 years later, the weapons manufacturer Applied Engineering (ApplE) joined the MAA, working together to push back the forces of the enemy. Culminating in Project Frenzy in 2017...' + nl;
vars.story.introText += 'You are our newest, star recruit. You are already known for your abilities and we are glad to have you join our team.' + nl;
vars.story.introText += 'Now go out there and destroy those invading, human hating, child eating (probably) scum!' + nl + nl + nl;

vars.story.introText += '* regarding the data leaks of 1985 resulting in the enemy now possessing our weapons: It was found out that one of the ranking members of the AC were accidentally leaking secrets to the NES group as they were using an old version of the Wyndeez operating system after following a You-Upload-Your-\nVideos-To-Here-For-\nOthers-To-See-Like\n-The-TV-But-Well-\nJust-Try-It-Youll-\nSee-Its-Really-Good (admittedly a terrible name) tutorial on "disabling automatic updates". Naturally the AC were embarrassed, making a full apology and posting it to ReadIt after a full inquiry was done. It turned out that some intern who had only been with the AC for about two weeks but had since magically disappeared was the cause for the lapse in security. Ironically, the information the NES group were gathering was also being taken by the enemy using a similar method. Weirdly, this same employee apparently worked for NES and was also the cause of their data leaks. The original 26 of the AC have vowed to find this intern and hold them accountable.' + nl;
vars.story.introText += 'FOOTNOTE: The only possible place shade field technology might still be used is when the enemies reach our inner atmosphere, where their entire ship would change color (usually to a golden yellow). It has no known defensive or offensive impact.' + nl;

function storyInit() {
    console.log('Checking version of phaser');
    vars.versionCheck();

    // START THE STORY SCROLLER
    vars.game.storyVisible = true;
    storyText = scene.add.bitmapText(0, vars.canvas.height, 'azo', vars.story.introText, 48).setCenterAlign().setAlpha(0.7).setMaxWidth(vars.canvas.width-20);
    storyText.x=10;
    let scrollHeight = storyText.height;
    let duration = scrollHeight*20;

    scene.tweens.add({
        targets: storyText,
        y: -scrollHeight,
        ease: 'linear',
        duration: duration,
        onComplete: startGame,
    })

    enableIntroSkip();
}

function enableIntroSkip() {
    window.onmousedown = function(e) {
        scene.tweens.add({
            targets: storyText,
            alpha: 0,
            duration: 3000,
            onComplete: storyTextSpeedUp,
        })
        vars.game.storyVisible = false;
        scene.sys.canvas.style.cursor = 'none';
    }
}



function storyTextSpeedUp() {
    vars.game.storyVisible = false;
    tw = scene.tweens.getTweensOf(storyText);
    tw[0].setTimeScale(1000);
}

/* 
1978 - Arcade
1980 – Atari 2600, Atari 400 and 800[4]
1982 – Atari 5200, Handheld electronic games[4][9]
1985 – Nintendo Entertainment System,[4] SG-1000[10]
1999 – WonderSwan[11]
2002 – VG Pocket Caplet[12]
2007 – Mobile phone[13]
2009 – iOS[14]
 */